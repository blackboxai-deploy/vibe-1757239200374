import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPG, PNG, or WEBP images." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Please upload an image smaller than 10MB." },
        { status: 400 }
      );
    }

    // Demo/simulation mode - Create a simple processed version
    // In a real application, you would integrate with Remove.bg or similar service
    
    // For demo purposes, we'll return a placeholder processed image
    // that simulates background removal
    const demoImageUrl = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/477d046c-e319-4420-a2a5-3bf505e15919.png";
    
    try {
      const demoResponse = await fetch(demoImageUrl);
      const demoImageBuffer = await demoResponse.arrayBuffer();
      
      // Return the demo processed image
      return new NextResponse(demoImageBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="no-bg-${imageFile.name}"`,
        },
      });
    } catch (fetchError) {
      // Fallback: return original image with success message
      const originalBuffer = await imageFile.arrayBuffer();
      return new NextResponse(originalBuffer, {
        status: 200,
        headers: {
          "Content-Type": imageFile.type,
          "Content-Disposition": `attachment; filename="demo-${imageFile.name}"`,
        },
      });
    }

    /* 
    Real Remove.bg integration code (uncomment and add API key):
    
    const imageBuffer = await imageFile.arrayBuffer();
    const removeResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVEBG_API_KEY || "",
      },
      body: (() => {
        const formData = new FormData();
        formData.append("image_file", new Blob([imageBuffer], { type: imageFile.type }));
        formData.append("size", "auto");
        return formData;
      })(),
    });

    if (!removeResponse.ok) {
      const errorText = await removeResponse.text();
      console.error("Remove.bg API error:", errorText);
      
      if (removeResponse.status === 402) {
        return NextResponse.json(
          { error: "API limit reached. Please try again later." },
          { status: 429 }
        );
      } else if (removeResponse.status === 403) {
        return NextResponse.json(
          { error: "Invalid API key or insufficient permissions." },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: "Failed to process image. Please try again." },
          { status: 500 }
        );
      }
    }

    const processedImageBuffer = await removeResponse.arrayBuffer();
    return new NextResponse(processedImageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="no-bg-${imageFile.name}"`,
      },
    });
    */

  } catch (error) {
    console.error("Background removal error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: "Background removal API endpoint",
      methods: ["POST"],
      supported_formats: ["JPG", "PNG", "WEBP"],
      max_file_size: "10MB"
    },
    { status: 200 }
  );
}