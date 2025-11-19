import { adminDb } from "@/lib/firebase-admin";
import { ApplicationDoc } from "@/types/database";
import { APPLICATION_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
} from "@/utils/firebase-queries";

export class ApplicationService {
  static async getApplications(): Promise<ApplicationDoc[] | null> {
    const applicationsSnapshot = await adminDb.collection(APPLICATION_COLLECTION).get();
    return getDocumentDataFromQuerySnapshot<ApplicationDoc>(applicationsSnapshot);
  }
  static async getApplication(id: string): Promise<ApplicationDoc | null> {
    const application = await adminDb.collection(APPLICATION_COLLECTION).doc(id).get();
    return getIDAndDocumentDataFromDocumentSnapshot<ApplicationDoc>(application);
  }
}
