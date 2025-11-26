import { adminDb } from "@/lib/firebase-admin";
import { SettingsPatch } from "@/types/api";
import { SettingsDoc, TagCategory } from "@/types/database";
import { GLOBAL_COLLECTION, SETTING_DOC_ID } from "@/utils/constants";
import { getIDAndDocumentDataFromDocumentSnapshot } from "@/utils/firebase-queries";
import { DocumentSnapshot, FieldValue } from "firebase-admin/firestore";

export class GlobalsService {
  static async deleteTagCategory(
    category: TagCategory,
    categoryType: "member" | "session",
  ): Promise<void> {
    try {
      const settings = await this.getSettingsData();
      if (!settings) {
        throw new Error("Settings document does not exist");
      }
      const currentCategories =
        categoryType === "member" ? settings.availableMemberTags : settings.availableSessionTags;
      const updatedCategories = currentCategories?.filter((c) => c.name !== category.name);
      const fieldName = categoryType === "member" ? "availableMemberTags" : "availableSessionTags";

      await adminDb
        .collection(GLOBAL_COLLECTION)
        .doc(SETTING_DOC_ID)
        .update({
          [fieldName]: updatedCategories,
        });
    } catch (error) {
      console.error("Error deleting tag category:", error);
      throw error;
    }
  }

  static async createTagCategory(
    category: TagCategory,
    categoryType: "member" | "session",
  ): Promise<void> {
    try {
      const settings = await this.getSettingsData();
      if (!settings) {
        throw new Error("Settings document does not exist");
      }
      const newCategory = { ...category, options: [] };
      const currentCategories =
        categoryType === "member" ? settings.availableMemberTags : settings.availableSessionTags;
      const updatedCategories = [...(currentCategories ?? []), newCategory];

      const fieldName = categoryType === "member" ? "availableMemberTags" : "availableSessionTags";

      await adminDb
        .collection(GLOBAL_COLLECTION)
        .doc(SETTING_DOC_ID)
        .update({
          [fieldName]: updatedCategories,
        });
    } catch (error) {
      console.error("Error creating tag category:", error);
      throw error;
    }
  }

  static async getCategories(): Promise<TagCategory[]> {
    const settings = await this.getSettingsData();
    if (!settings) {
      return [];
    }
    const sessionCategories = settings?.availableSessionTags || [];
    const memberCategories = settings?.availableMemberTags || [];
    return [...memberCategories, ...sessionCategories];
  }

  static async getSettingsData(): Promise<SettingsDoc | null> {
    const settingsSnapshot = await this.getSettingsSnapshot();
    return getIDAndDocumentDataFromDocumentSnapshot<SettingsDoc>(settingsSnapshot);
  }

  static async getSettingsSnapshot(): Promise<DocumentSnapshot<SettingsDoc>> {
    const settingsSnapshot = await adminDb.collection(GLOBAL_COLLECTION).doc(SETTING_DOC_ID).get();
    return settingsSnapshot;
  }

  static async getTags(category?: "member" | "session"): Promise<TagCategory[] | undefined> {
    const settings = await this.getSettingsData();
    if (!settings) {
      return undefined;
    }
    if (category === "member") {
      return settings.availableMemberTags;
    }
    if (category === "session") {
      return settings.availableSessionTags;
    }
    return [...(settings.availableMemberTags ?? []), ...(settings.availableSessionTags ?? [])];
  }

  static async createTag(category: "member" | "session", tag: TagCategory): Promise<void> {
    const categoryToPush = category === "member" ? "availableMemberTags" : "availableSessionTags";

    await adminDb
      .collection(GLOBAL_COLLECTION)
      .doc(SETTING_DOC_ID)
      .update({
        [categoryToPush]: FieldValue.arrayUnion(tag),
      });
  }

  static async updateTag(
    category: "member" | "session",
    oldTag: TagCategory,
    newTag: TagCategory,
  ): Promise<void> {
    const categoryToUpdate = category === "member" ? "availableMemberTags" : "availableSessionTags";
    const docRef = adminDb.collection(GLOBAL_COLLECTION).doc(SETTING_DOC_ID);

    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new Error("Settings document does not exist");
      }

      const data = doc.data() as SettingsDoc;
      const tags = category === "member" ? data.availableMemberTags : data.availableSessionTags;

      if (!tags) {
        throw new Error("No tags found for this category");
      }

      const updatedTags = tags.map((t) => (t.name === oldTag.name ? newTag : t));

      transaction.update(docRef, { [categoryToUpdate]: updatedTags });
    });
  }

  static async deleteTag(category: "member" | "session", tagName: string): Promise<void> {
    const categoryToUpdate = category === "member" ? "availableMemberTags" : "availableSessionTags";
    const docRef = adminDb.collection(GLOBAL_COLLECTION).doc(SETTING_DOC_ID);

    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new Error("Settings document does not exist");
      }

      const data = doc.data() as SettingsDoc;
      const tags = category === "member" ? data.availableMemberTags : data.availableSessionTags;

      if (!tags) {
        throw new Error("No tags found for this category");
      }

      const updatedTags = tags.filter((t) => t.name !== tagName);

      transaction.update(docRef, { [categoryToUpdate]: updatedTags });
    });
  }

  static async patchSettingsData(patch: SettingsPatch): Promise<void> {
    try {
      if (patch.membershipContracts) {
        await this.appendMembershipContracts(patch.membershipContracts);
        // TODO: Update addresses with the new membership contracts
        return;
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  private static async appendMembershipContracts(membershipContracts: string[]): Promise<void> {
    await adminDb
      .collection(GLOBAL_COLLECTION)
      .doc(SETTING_DOC_ID)
      .update({
        membershipContracts: FieldValue.arrayUnion(...membershipContracts),
      });
  }
}
