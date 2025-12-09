import { adminDb } from "@/lib/firebase-admin";
import { ImageResponse } from "@vercel/og";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

export const runtime = "nodejs"; // Use Node.js runtime to support firebase-admin and fs

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    console.log("im here");

    const artist = searchParams.get("artist") || "";
    const song = searchParams.get("song") || "";
    const bgImage = searchParams.get("bgImage") || "";
    const hash = searchParams.get("hash") || "";
    const avatars = searchParams.getAll("avatars");
    const countParam = searchParams.get("count");
    const collaboratorCount = countParam ? parseInt(countParam, 10) : avatars.length;

    // Load Fonts
    // We use readFileSync because we are in Node.js runtime
    const authenticSansData = fs.readFileSync(
      path.join(process.cwd(), "fonts/authentic-sans-130.woff"),
    );
    const authenticCondensedData = fs.readFileSync(
      path.join(process.cwd(), "fonts/authentic-sans-condensed-130.woff"),
    );

    // Fetch SVG if hash is provided
    let svgContent = "";
    if (hash) {
      try {
        const bounceDoc = await adminDb.collection("audio").doc(hash).get();
        if (bounceDoc.exists) {
          // Assuming waveTrace is an SVG string or path
          svgContent = bounceDoc.data()?.waveTrace || "";
        }
      } catch (e) {
        console.error("Error fetching audio hash for OG:", e);
      }
    }

    // Process SVG Content to ensure it renders in Satori
    // Satori has limited SVG support. It handles standard shapes and paths well.
    // If svgContent is a full <svg> string, we might need to extract the inner content or wrap it correctly.
    // If the database stores the full <svg ...>...</svg> string, we can use it directly or sanitize it.
    // Based on previous files, it seems to be HTML content injected via dangerouslySetInnerHTML.

    // If svgContent doesn't start with <svg, wrap it?
    // Let's assume for now we can render it as a div with dangerouslySetInnerHTML-like behavior
    // But ImageResponse doesn't support dangerouslySetInnerHTML prop like React DOM.
    // We need to parse it or if it's just a string of text, that's wrong.
    // Satori supports <svg> elements.

    // If `svgContent` is the inner HTML of an SVG (paths), we need to wrap it in <svg>.
    // If it's the full SVG, we need to make sure it doesn't have unsupported attributes.
    // A safer bet for "waveTrace" usually implies path data or simple SVG.
    // Let's try to render it as an image src if it's base64? No, it's likely raw markup.
    // For now, let's try to just render it. If it fails, we might need to refine.

    // Basic Satori Layout matching the SCSS
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
            }}
          />

          {/* Logo */}
          {/* We need the absolute URL for the logo image or read it from fs and base64 it */}
          {/* Assuming we can use the public URL if available, or we serve it from the app */}
          <img
            src={`${process.env.NEXT_PUBLIC_FRONTEND_URL || "https://phlote.co"}/images/Phlotelogo.png`}
            style={{
              position: "absolute",
              width: "240px", // 20vw of 1200
              left: "66px", // 5.5vw of 1200
              top: "66px",
            }}
          />

          {/* Bottom Lock */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "66px", // 5.5vw
              display: "flex",
              flexDirection: "column",
            }}>
            {/* Avatar Area */}
            {avatars && avatars.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "24px", // 2vw
                  gap: "24px",
                }}>
                {/* Avatar Stack */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  {avatars.slice(0, 3).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      style={{
                        width: "48px", // 4vw
                        height: "48px",
                        borderRadius: "50%",
                        border: "2px solid white",
                        marginLeft: i === 0 ? 0 : "-12px", // -1vw
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
                        fontSize: "18px", // 1.5vw
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
                    fontSize: "108px", // 9vw
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
                    fontSize: "108px", // 9vw
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
                  marginTop: "24px", // 2vw
                  height: "120px", // 10vw
                  width: "100%",
                  display: "flex",
                }}>
                {/* Assuming svgContent is full <svg> string, we might need to parse/clean it.
                        For simplicity in this example, if it's complex, we might simply not render it
                        or try to inject it.
                        Note: ImageResponse doesn't support string injection of SVG easily without parsing.
                        But we can try to render it as a data URI image if we have the string.
                    */}
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
