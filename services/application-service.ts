import { adminDb } from "@/lib/firebase-admin";
import { ApplicationDoc, ApplicationDocWithID } from "@/types/database";
import { APPLICATION_COLLECTION } from "@/utils/constants";
import {
  getIDAndDocumentDataFromDocumentSnapshot,
  getIDAndDocumentDataFromQuerySnapshot,
} from "@/utils/firebase-queries";
import { applicationFormSchema } from "@/utils/zod-schemas";
import { z } from "zod";

export class ApplicationService {
  static async getApplications(): Promise<ApplicationDocWithID[]> {
    const applicationsSnapshot = await adminDb.collection(APPLICATION_COLLECTION).get();
    return getIDAndDocumentDataFromQuerySnapshot<ApplicationDoc>(applicationsSnapshot);
  }
  static async getApplication(id: string): Promise<ApplicationDoc | null> {
    const application = await adminDb.collection(APPLICATION_COLLECTION).doc(id).get();
    return getIDAndDocumentDataFromDocumentSnapshot<ApplicationDoc>(application);
  }

  static async createApplication(
    application: z.infer<typeof applicationFormSchema>,
  ): Promise<string> {
    try {
      const ref = await adminDb.collection(APPLICATION_COLLECTION).add(application);
      return ref.id;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  }
}
