import { adminDb } from "@/lib/firebase-admin";
import { SUBSCRIBERS_COLLECTION } from "@/utils/constants";
import { WriteResult } from "firebase-admin/firestore";

export class NewsletterService {
  static async addSubscriber(email: string): Promise<void> {
    await this.createSubscriberInFlodesk(email);

    if (!process.env.FLODESK_SEGMENT_ID) {
      throw new Error("FLODESK_SEGMENT_ID is not set");
    }

    const flodeskSegmentData = await this.addSubscriberToFlodeskSegment(email, [
      process.env.FLODESK_SEGMENT_ID,
    ]);

    await this.addSubscriberToDatabase(email, flodeskSegmentData.id);
  }

  static async createSubscriberInFlodesk(email: string): Promise<Record<string, unknown>> {
    const flodeskUser = await fetch(`${process.env.FLODESK_API_URL}/v1/subscribers`, {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
    const flodeskUserData = await flodeskUser.json();
    return flodeskUserData;
  }

  static async addSubscriberToFlodeskSegment(
    email: string,
    segmentIDs: string[],
  ): Promise<{ id: string }> {
    const flodeskUser = await fetch(
      `${process.env.FLODESK_API_URL}/v1/subscribers/${email}/segments`,
      {
        method: "POST",
        body: JSON.stringify({
          segment_ids: segmentIDs,
        }),
      },
    );
    const flodeskUserData = await flodeskUser.json();
    return flodeskUserData;
  }

  static async addSubscriberToDatabase(email: string, flodeskID: string): Promise<WriteResult> {
    const subscriber = await adminDb.collection(SUBSCRIBERS_COLLECTION).doc(email).set({
      email,
      flodeskID,
      created: new Date(),
    });
    return subscriber;
  }
}
