import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

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
      prompt,
      videoCreator,
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
        prompt,
        status: "processing", // Set initial status as ready
        tokenId: token.id, // Associate with the token
        creator: videoCreator,
      },
    });

    return NextResponse.json({
      message: "Token and video successfully registered",
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
