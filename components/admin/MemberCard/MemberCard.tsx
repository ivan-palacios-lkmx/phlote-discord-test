"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input/Input";
import AdminToggle from "@/components/admin/AdminToggle/AdminToggle";
import MultiSelect from "@/components/admin/MultiSelect/MultiSelect";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { usePatchAddress } from "@/hooks/query/mutations/use-patch-address";
import { useUpdatePrivateAddress } from "@/hooks/query/mutations/use-update-private-address";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetAddressPrivateInfo } from "@/hooks/query/query-hooks/use-get-address-private-info";
import { useGetSettings } from "@/hooks/query/query-hooks/use-get-settings";
import { AddressDocWithID, ContactDocWithID, TagCategory } from "@/types/database";
import { memberCardSchema } from "@/utils/zod-schemas";
import kebabCase from "lodash/kebabCase";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import "./MemberCard.scss";

interface MemberCardProps {
  member: AddressDocWithID;
}

export default function MemberCard({ member }: MemberCardProps) {
  const [memberTagsRaw, setMemberTagsRaw] = useState<string[][]>([]);

  const { data: settings } = useGetSettings();
  const { data: addressInfo } = useGetAddressInfo(member.id, false, !!member.id);
  const { data: privateInfo } = useGetAddressPrivateInfo(member.id, !!member.id);

  const memberTags = useMemo<TagCategory[]>(() => {
    return (settings?.availableMemberTags as TagCategory[] | undefined) || [];
  }, [settings]);

  function encodeTag(category: string, value: string): string {
    const cleanCategory = kebabCase(String(category).trim());
    const cleanValue = kebabCase(String(value).trim());
    return `${cleanCategory}:${cleanValue}`;
  }

  function decodeTag(tag: string): { name: string; value: string } {
    const parts = tag.split(":");
    if (parts.length !== 2) return { name: "", value: "" };
    return { name: parts[0], value: parts[1] };
  }

  // this function is used to encode the tags from the frontend format to the backend format
  const memberTagsInBackendFormat = useMemo(() => {
    return memberTags.reduce((agg, group, i) => {
      const categoryName = group.name;
      (memberTagsRaw[i] || []).forEach((tag) => {
        agg.push(encodeTag(categoryName, tag));
      });
      return agg;
    }, [] as string[]);
  }, [memberTags, memberTagsRaw]);

  // this useEffect is used to decode the tags from the backend format to the frontend format
  useEffect(() => {
    if (!memberTags.length || !addressInfo?.tags) return;

    const newTagsRaw = memberTags.map(() => [] as string[]);
    (addressInfo.tags as string[]).forEach((tag) => {
      const { name: tagName, value: tagValue } = decodeTag(tag);
      const groupIdx = memberTags.findIndex((group) => kebabCase(group.name) === tagName);
      if (groupIdx >= 0 && newTagsRaw[groupIdx]) {
        const originalValue = memberTags[groupIdx].options?.find(
          (opt) => kebabCase(opt) === tagValue,
        );
        if (originalValue) {
          newTagsRaw[groupIdx].push(originalValue);
        }
      }
    });
    setMemberTagsRaw(newTagsRaw);
  }, [addressInfo?.tags, memberTags]);

  const { mutate: patchAddress } = usePatchAddress();
  const { mutate: updatePrivateAddress } = useUpdatePrivateAddress();

  function handleSave(formValues: z.infer<typeof memberCardSchema>) {
    const address = member.id;
    // TODO: Fix the tags being passed to the backend
    patchAddress(
      {
        address,
        title: formValues.title || undefined,
        tags: memberTagsInBackendFormat.length > 0 ? memberTagsInBackendFormat : undefined,
        visibility: (formValues.isPublic ? "public" : "private") as "public" | "private",
      },
      {
        onSuccess: () => {
          if (formValues.name || formValues.twitterHandle || formValues.email) {
            const contact: ContactDocWithID = {
              id: address,
              name: formValues.name || undefined,
              twitterHandle: formValues.twitterHandle || undefined,
              email: formValues.email || undefined,
            };
            updatePrivateAddress({ address, contact });
          }
        },
      },
    );
  }

  const resetValues = useMemo(() => {
    return {
      isPublic: !!addressInfo?.isPublic,
      name: privateInfo?.name || "",
      title: addressInfo?.title || "",
      twitterHandle: privateInfo?.twitterHandle || "",
      email: privateInfo?.email || "",
    };
  }, [addressInfo, privateInfo]);

  if (!member?.id) {
    return null;
  }

  return (
    <Form
      schema={memberCardSchema}
      handleSubmit={handleSave}
      className="member-card"
      resetValues={resetValues}>
      <div className="member-row">
        <div className="user">
          <Web3Avatar avatar={addressInfo?.avatar || ""} className="member-avatar" />
          <div className="username">
            <h6>
              <Web3Username username={addressInfo?.username || ""} />
            </h6>
            <span className="subtext">{addressInfo?.isPublic ? "Public" : "Private"}</span>
          </div>
        </div>
        <div className="private-toggle">
          <AdminToggle
            name="isPublic"
            defaultValue={!!addressInfo?.isPublic}
            resetValue={!!addressInfo?.isPublic}
          />
        </div>
      </div>

      <div className="inputs">
        <label className="label">Name</label>
        <Input name="name" placeholder="John Doe" className="text-inpt" type="text" />

        <label className="label">Title</label>
        <Input name="title" placeholder="Songwriter" className="text-inpt" type="text" />

        <label className="label">Twitter</label>
        <Input
          name="twitterHandle"
          placeholder="@handle"
          pattern="^@(\w){1,15}$"
          className="text-inpt"
          type="text"
        />

        <label className="label">Email</label>
        <Input name="email" placeholder="name@domain.com" className="text-inpt" type="email" />

        {memberTags.map((tag, i) => (
          <div key={i} className="tag-select">
            <label className="label">{tag.name}</label>
            <MultiSelect
              name={`memberTags[${i}]`}
              options={tag.options || []}
              closeOnSelect={false}
            />
          </div>
        ))}
      </div>

      <div className="cta-row">
        <button className="btn" type="submit" disabled={false}>
          Save
        </button>
      </div>
    </Form>
  );
}
