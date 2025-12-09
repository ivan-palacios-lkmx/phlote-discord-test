import { ImageResponse } from "@vercel/og";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const bgImage = searchParams.get("bgImage") || "";

    // Load Fonts
    const authenticSansData = fs.readFileSync(
      path.join(process.cwd(), "fonts/authentic-sans-130.woff"),
    );
    const authenticCondensedData = fs.readFileSync(
      path.join(process.cwd(), "fonts/authentic-sans-condensed-130.woff"),
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f1f1f1",
            position: "relative",
            fontFamily: '"Authentic Sans"',
            textTransform: "uppercase",
            color: "white",
          }}>
          {/* Background Image */}
          {bgImage && (
            <img
              src={bgImage}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>
      ),
      {
        width: 1200,
        height: 1200,
        fonts: [
          {
            name: "Authentic Sans",
            data: authenticSansData,
            style: "normal",
          },
          {
            name: "Authentic Condensed",
            data: authenticCondensedData,
            style: "normal",
          },
        ],
      },
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`${e.message}`);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
