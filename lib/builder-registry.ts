"use client";
import { builder, Builder } from "@builder.io/react";

// Initialize Builder.io with your API key
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY || "");

// Import dynamic components
import BookNowButton from "../client/components/BookNowButton";

// Register Book Now Button Component
Builder.registerComponent(BookNowButton, {
  name: "BookNowButton",
  friendlyName: "Book Now Button",
  description: "Reusable booking button with modal integration",
  inputs: [
    {
      name: "buttonName",
      type: "string",
      defaultValue: "Book Now",
      description: "Button display name/text"
    },
    {
      name: "text",
      type: "string",
      defaultValue: "Book Now",
      description: "Button text (legacy - use buttonName instead)"
    },
    {
      name: "size",
      type: "string",
      enum: ["sm", "lg", "default"],
      defaultValue: "default",
      description: "Button size"
    },
    {
      name: "variant",
      type: "string",
      enum: ["default", "outline", "ghost", "link"],
      defaultValue: "default",
      description: "Button variant"
    },
    {
      name: "className",
      type: "string",
      defaultValue: "bg-coral hover:bg-coral/90 text-white",
      description: "Custom CSS classes"
    },
    {
      name: "showIcon",
      type: "boolean",
      defaultValue: false,
      description: "Show calendar icon"
    },
  ],
});

// Export the builder instance for use in other files
export { builder };
