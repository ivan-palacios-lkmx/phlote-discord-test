import { ImageResponse } from "@vercel/og";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const artist = searchParams.get("artist") || "";
    const song = searchParams.get("song") || "";
    const bgImage = searchParams.get("bgImage") || "";
    const avatars = searchParams.getAll("avatars");
    const countParam = searchParams.get("count");
    const collaboratorCount = countParam ? parseInt(countParam, 10) : avatars.length;

    // Load Fonts
    const authenticSansData = fs.readFileSync(
      path.join(process.cwd(), "fonts/authentic-sans-130.woff"),
    );
    const authenticCondensedData = fs.readFileSync(
      path.join(process.cwd(), "fonts/authentic-sans-condensed-130.woff"),
    );

    // SVG Content disabled for testing/debugging without Firebase
    const svgContent = "";

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
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            />
          )}

          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "linear-gradient(180deg, rgba(85, 85, 85, 0.25) 0%, rgba(0, 0, 0, 0.55) 100%)",
              zIndex: 1,
            }}
          />

          {/* Logo */}
          <img
            src={`${process.env.NEXT_PUBLIC_FRONTEND_URL || "https://phlote.co"}/images/Phlotelogo.png`}
            style={{
              position: "absolute",
              width: "240px",
              left: "66px",
              top: "66px",
              zIndex: 2,
            }}
          />

          {/* Bottom Lock */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "66px",
              display: "flex",
              flexDirection: "column",
              zIndex: 2,
            }}>
            {/* Avatar Area */}
            {avatars && avatars.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "24px",
                  gap: "24px",
                }}>
                {/* Avatar Stack */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  {avatars.slice(0, 3).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: "2px solid white",
                        marginLeft: i === 0 ? 0 : "-12px",
                        objectFit: "cover",
                        backgroundColor: "#333",
                      }}
                    />
                  ))}
                  {avatars.length > 3 && (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: "2px solid white",
                        marginLeft: "-12px",
                        backgroundColor: "black",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}>
                      +{collaboratorCount - 3}
                    </div>
                  )}
                </div>

                {/* Collaborator Count */}
                <div style={{ fontSize: "24px", display: "flex" }}>
                  {collaboratorCount} Collaborators
                </div>
              </div>
            )}

            {/* Metadata */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}>
              {artist && (
                <h1
                  style={{
                    fontSize: "108px",
                    lineHeight: "90%",
                    fontFamily: '"Authentic Condensed"',
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: "-2px",
                  }}>
                  {artist}
                </h1>
              )}
              {song && (
                <h1
                  style={{
                    fontSize: "108px",
                    lineHeight: "90%",
                    fontFamily: '"Authentic Condensed"',
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: "-2px",
                  }}>
                  “{song}”
                </h1>
              )}
            </div>

            {/* Track Preview SVG */}
            {svgContent && (
              <div
                style={{
                  marginTop: "24px",
                  height: "120px",
                  width: "100%",
                  display: "flex",
                }}>
                <img
                  src={`data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}
          </div>
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
