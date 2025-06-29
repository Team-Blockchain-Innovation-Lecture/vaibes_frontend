import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import { clusterApiUrl } from "@solana/web3.js";
import { createSignerFromKeypair } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { publicKey } from "@metaplex-foundation/umi";
import {
  createAssociatedToken,
  transferTokens,
} from "@metaplex-foundation/mpl-toolbox";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const prisma = new PrismaClient();

// Retrieve the private key from an environment variable
const getKeypair = () => {
  const privateKeyString = process.env.WALLET_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error("WALLET_PRIVATE_KEY is not set in environment variables");
  }
  const privateKeyArray = Uint8Array.from(JSON.parse(privateKeyString));
  const umi = createUmi(clusterApiUrl("devnet"));
  return createSignerFromKeypair(umi, {
    publicKey: publicKey(privateKeyArray.slice(32)),
    secretKey: privateKeyArray,
  });
};

// // Upload metadata to Pinata
// async function uploadMetadataToPinata(metadata: any) {
//   try {
//     console.log('Uploading metadata to Pinata:', metadata);

//     const response = await fetch('https://uploads.pinata.cloud/v3/files', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/offset+octet-stream',
//         'Upload-Length': JSON.stringify(metadata).length.toString(),
//         Authorization: `Bearer ${process.env.PINATA_JWT}`,
//       },
//       body: JSON.stringify(metadata),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Pinata API error:', {
//         status: response.status,
//         statusText: response.statusText,
//         error: errorText,
//       });
//       throw new Error(
//         `Failed to upload to Pinata: ${response.status} ${response.statusText} - ${errorText}`
//       );
//     }

//     const data = await response.json();
//     console.log('Pinata upload successful:', data);
//     return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
//   } catch (error) {
//     console.error('Error uploading to Pinata:', error);
//     throw error;
//   }
// }

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const {
      tokenAddress,
      title,
      description,
      url,
      thumbnailUrl,
      duration,
      createdWith,
      lyrics,
      videoCreator,
      userPublicKey,
    } = body;

    // Validate required fields
    if (!tokenAddress) {
      return NextResponse.json(
        { message: "Token address is required" },
        { status: 400 }
      );
    }

    if (!title || !url) {
      return NextResponse.json(
        { message: "Video title and URL are required" },
        { status: 400 }
      );
    }

    // Fetch token data from Helius API to validate token exists
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (!heliusApiKey) {
      return NextResponse.json(
        { message: "Server configuration error - API key not found" },
        { status: 500 }
      );
    }

    // Call Helius API to get token data
    const heliusResponse = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "get-metadata",
          method: "getAsset",
          params: {
            id: tokenAddress,
            displayOptions: {
              showFungible: true,
            },
          },
        }),
      }
    );

    if (!heliusResponse.ok) {
      console.error("Helius API error:", await heliusResponse.text());
      return NextResponse.json(
        { message: "Token not found or invalid" },
        { status: 400 }
      );
    }

    const tokenData = await heliusResponse.json();
    console.log("Token data:", tokenData);

    // Check if we got a valid response with token data
    if (!tokenData.result || !tokenData.result.content) {
      return NextResponse.json(
        { message: "Token not found or invalid" },
        { status: 400 }
      );
    }

    // Get token metadata from json_uri
    let tokenMetadata: Record<string, any> = {};
    let logoUrl = "";

    if (tokenData.result.content.json_uri) {
      // Replace ipfs.io with gateway.pinata.cloud
      const urlMatch = tokenData.result.content.json_uri.match(
        /^(https?:\/\/[^\/]+)(.*)$/
      );
      const metadataUrl = urlMatch
        ? `https://gateway.pinata.cloud${urlMatch[2]}`
        : tokenData.result.content.json_uri;

      try {
        const metadataResponse = await fetch(metadataUrl);
        if (metadataResponse.ok) {
          tokenMetadata = await metadataResponse.json();

          // Get logo URL and replace domain if needed
          if (tokenMetadata.image) {
            const imageUrlMatch = tokenMetadata.image.match(
              /^(https?:\/\/[^\/]+)(.*)$/
            );
            if (imageUrlMatch) {
              // Replace domain while preserving path portion
              logoUrl = `https://gateway.pinata.cloud${imageUrlMatch[2]}`;
            } else {
              logoUrl = tokenMetadata.image;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching token metadata:", error);
        // Continue without metadata - not a fatal error
      }
    }

    // Extract data for token model
    const tokenName =
      tokenMetadata.name ||
      tokenData.result.content?.metadata?.name ||
      "Unknown Token";

    const tokenSymbol =
      tokenMetadata.symbol || tokenData.result.content?.metadata?.symbol || "";

    const tokenDescription =
      tokenMetadata.description ||
      tokenData.result.content?.metadata?.description ||
      "";

    // Social links
    const telegramLink = tokenMetadata.telegram || null;
    const websiteLink = tokenMetadata.website || null;
    const twitterLink = tokenMetadata.twitter || null;

    // Token creator
    const tokenCreator =
      tokenData.result.creators && tokenData.result.creators.length > 0
        ? tokenData.result.creators[0].address
        : "Unknown Creator";

    // Token info
    const decimals = tokenData.result.token_info?.decimals || null;
    const totalSupply = tokenData.result.token_info?.supply
      ? BigInt(tokenData.result.token_info.supply)
      : null;
    const tokenProgram = tokenData.result.token_info?.token_program || null;

    // Calculate market cap
    let marketCap = null;
    if (
      totalSupply !== null &&
      decimals !== null &&
      tokenData.result.token_info?.price_info?.price_per_token
    ) {
      const pricePerToken =
        tokenData.result.token_info.price_info.price_per_token;
      const totalSupplyNumber = Number(totalSupply) / Math.pow(10, decimals);
      marketCap = totalSupplyNumber * pricePerToken;
    }

    // Check if token already exists in the database
    let token = await prisma.token.findUnique({
      where: { mint: tokenAddress },
    });

    console.log("tokenAddress:", tokenAddress);
    console.log("websiteLink:", websiteLink);

    console.log("Token:", token);

    // If token already exists, update it with market cap info, otherwise create new token
    if (token) {
      // Update existing token with market cap data
      token = await prisma.token.update({
        where: { id: token.id },
        data: {
          marketCap,
        },
      });
    } else {
      // Create new token with all data
      token = await prisma.token.create({
        data: {
          mint: tokenAddress,
          name: tokenName,
          symbol: tokenSymbol,
          description: tokenDescription,
          creator: tokenCreator,
          logo: logoUrl,
          telegramLink,
          websiteLink,
          twitterLink,
          decimals,
          totalSupply,
          tokenProgram,
          marketCap,
        },
      });
    }

    // Create the video and associate it with the token
    const video = await prisma.video.create({
      data: {
        title,
        description,
        url,
        thumbnailUrl,
        duration,
        createdWith,
        prompt: lyrics,
        status: "processing", // Set initial status as ready
        token: {
          connect: { id: token.id }, // `id` is a unique key of Token
        },
        creator: videoCreator,
      },
    });

    setImmediate(async () => {
      // Create NFT for the video
      const startTime = Date.now();
      const TIMEOUT_MS = 5 * 60 * 1000; // 5-minute timeout
      const MAX_RETRIES = 3; // Maximum number of retries

      // NFT creation function with retry function
      const createNFTWithRetry = async (retryCount = 0): Promise<void> => {
        try {
          console.log(
            `Starting NFT creation for video ${video.id} (attempt ${
              retryCount + 1
            }/${MAX_RETRIES + 1})`
          );

          const keypair = getKeypair();
          const umi = createUmi(clusterApiUrl("devnet"))
            .use(mplTokenMetadata())
            .use(keypairIdentity(keypair))
            .use(irysUploader({ address: "https://devnet.irys.xyz" }));

          umi.programs.add({
            name: "splToken",
            publicKey: publicKey(TOKEN_PROGRAM_ID.toBase58()),
            getErrorFromCode: () => null,
            getErrorFromName: () => null,
            isOnCluster: () => true,
          });

          umi.programs.add({
            name: "associatedToken",
            publicKey: publicKey(ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()),
            getErrorFromCode: () => null,
            getErrorFromName: () => null,
            isOnCluster: () => true,
          });

          // Create NFT mint
          const mint = generateSigner(umi);

          // Create NFT metadata
          const nftMetadata = {
            name: title,
            symbol: "Vaibes Video NFT",
            description: description || "",
            image: thumbnailUrl,
            animation_url: url,
            properties: {
              files: [
                {
                  uri: thumbnailUrl,
                  type: "image/jpeg",
                },
                {
                  uri: url,
                  type: "video/mp4",
                },
              ],
              category: "video",
            },
            attributes: [
              {
                trait_type: "Type",
                value: "Video NFT",
              },
              {
                trait_type: "Duration",
                value: duration,
              },
              {
                trait_type: "tokenAddress",
                value: tokenAddress,
              },
              {
                trait_type: "tokenName",
                value: tokenName,
              },
              {
                trait_type: "tokenSymbol",
                value: tokenSymbol,
              },
              {
                trait_type: "tokenDescription",
                value: tokenDescription,
              },
              {
                trait_type: "tokenCreator",
                value: tokenCreator,
              },
              {
                trait_type: "tokenProgram",
                value: tokenProgram,
              },
              {
                trait_type: "createdWith",
                value: createdWith,
              },
              {
                trait_type: "lyrics",
                value: lyrics,
              },
              {
                trait_type: "videoCreator",
                value: videoCreator,
              },
            ],
            collection: {
              name: "Vaibes Video NFTs",
              family: "Vaibes",
            },
          };

          // Upload metadata to Pinata
          const nftMetadataUri = await umi.uploader.uploadJson(nftMetadata);

          // Create NFT
          const nft = await createNft(umi, {
            mint,
            name: title,
            symbol: "VIDEO",
            uri: nftMetadataUri,
            sellerFeeBasisPoints: 0 as any,
            creators: [
              {
                address: umi.identity.publicKey,
                verified: true,
                share: 100,
              },
            ],
            isCollection: false,
            updateAuthority: umi.identity.publicKey,
          }).sendAndConfirm(umi);

          const userKey = new PublicKey(userPublicKey);
          // Create Associated Token Account and transfer NFT
          const mintKey = new PublicKey(mint.publicKey);

          // Create ATA for user
          await createAssociatedToken(umi, {
            mint: mint.publicKey,
            owner: publicKey(userKey.toBase58()),
          }).sendAndConfirm(umi);

          // Get ATA addresses
          const sourceAta = getAssociatedTokenAddressSync(
            mintKey,
            new PublicKey(umi.identity.publicKey)
          );
          const destAta = getAssociatedTokenAddressSync(mintKey, userKey);

          // Transfer NFT to user
          await transferTokens(umi, {
            source: publicKey(sourceAta.toBase58()),
            destination: publicKey(destAta.toBase58()),
            authority: umi.identity,
            amount: 1,
          }).sendAndConfirm(umi);

          console.log("NFT Mint:", mint.publicKey.toString());
          console.log("Destination ATA:", destAta.toString());
          console.log("Source ATA:", sourceAta.toString());
          console.log("Destination ATA:", destAta.toString());
          // console.log("nftSignature:", nft.signature);

          // Update video with NFT address
          await prisma.video.update({
            where: { id: video.id },
            data: {
              nft_address: mint.publicKey.toString(),
              status: "completed", // Update status to completed
            },
          });

          console.log(`Video ${video.id} updated with NFT address`);
          return; // Exit function if successful.
        } catch (error: any) {
          const endTime = Date.now();
          console.error(
            `Error creating NFT for video ${video.id} after ${
              endTime - startTime
            }ms (attempt ${retryCount + 1}):`,
            error
          );

          // Check for retriable errors
          const isRetryableError = (error: any): boolean => {
            const retryableErrors = [
              "timeout",
              "network",
              "connection",
              "rate limit",
              "temporary",
              "server error",
              "502",
              "503",
              "504",
              "incorrect program id",
              "simulation failed",
              "transaction simulation failed",
              "invalid account data",
              "InvalidAccountData",
            ];

            const errorMessage = error.message?.toLowerCase() || "";
            const errorCode = error.code?.toString() || "";

            // Log detailed error information for debugging
            console.log("Error details:", {
              message: error.message,
              code: error.code,
              logs: error.transactionLogs,
              signature: error.signature,
            });

            return retryableErrors.some(
              (keyword) =>
                errorMessage.includes(keyword) || errorCode.includes(keyword)
            );
          };

          // If the retry count has not reached the limit
          if (retryCount < MAX_RETRIES && isRetryableError(error)) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1 sec, 2 sec,
            console.log(`Retrying NFT creation in ${delay}ms...`);

            await new Promise((resolve) => setTimeout(resolve, delay));
            return createNFTWithRetry(retryCount + 1);
          }

          // No retry possible or maximum number of retries reached
          console.error(`NFT creation failed after ${retryCount + 1} attempts`);
        }
      };

      //  Start NFT creation
      try {
        await createNFTWithRetry();
      } catch (error: any) {
        console.error(
          `Final error after all retries for video ${video.id}:`,
          error
        );
      }
    });

    return NextResponse.json({
      message: "Token, video, and NFT successfully registered",
      tokenId: token.id,
      videoId: video.id,
    });
  } catch (error) {
    console.error("Error in release API:", error);
    return NextResponse.json(
      { message: "An error occurred processing your request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
