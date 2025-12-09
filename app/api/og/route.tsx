import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "red",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 100,
          color: "white",
        }}>
        TEST OG
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
