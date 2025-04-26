"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function ReleaseButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form validation
  const validateInput = (input: string): boolean => {
    // Reset error state
    setError("");

    // Check if input is empty
    if (!input.trim()) {
      setError("Token address or URL is required");
      return false;
    }

    // Check if input is a URL
    if (input.startsWith("http")) {
      // Validate it's a pump.fun URL
      const isPumpFunUrl = input.includes("pump.fun/coin/");
      if (!isPumpFunUrl) {
        setError("URL must be a valid pump.fun token page");
        return false;
      }
      return true;
    }

    // If not a URL, assume it's a token address
    // Basic validation for Solana addresses (they are usually 44 characters)
    if (input.length < 30) {
      setError("Token address appears to be invalid");
      return false;
    }

    return true;
  };

  // Extract token address from URL or return the address directly
  const extractTokenAddress = (input: string): string => {
    if (input.includes("pump.fun/coin/")) {
      const parts = input.split("pump.fun/coin/");
      return parts[1].split(/[?#]/)[0]; // Remove query params if any
    }
    return input;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInput(tokenInput)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenAddress = extractTokenAddress(tokenInput);

      // Dummy video data for now, as requested
      const videoData = {
        title: "Example Video Title",
        description: "This is a sample video description",
        url: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/thumbnail.jpg",
        duration: 120, // 2 minutes in seconds
        createdWith: "AI Video Generator",
        prompt: "Create an animated video showcasing this token",
      };

      // API call to register the token and video
      const response = await fetch("/api/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenAddress,
          ...videoData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to register token");
      }

      // Success!
      toast({
        title: "Success!",
        description: "Your token has been successfully released.",
      });

      // Close dialog and reset form
      setDialogOpen(false);
      setTokenInput("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to register token",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
          Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Release Token Video</DialogTitle>
          <DialogDescription>
            Enter the pump.fun token contract address or URL to release your
            AI-generated video for this token.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="token-input">
                Token Address or URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="token-input"
                placeholder="https://pump.fun/coin/... or token address"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-sm text-muted-foreground">
                Enter a valid pump.fun token URL or contract address
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
