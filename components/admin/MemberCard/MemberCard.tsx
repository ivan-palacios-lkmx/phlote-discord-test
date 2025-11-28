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

function AvatarFromAddress({ address, className }: { address: string; className?: string }) {
  const { data: addressInfo } = useGetAddressInfo(address, false, !!address);

  if (!addressInfo?.avatar) {
    return <div className={`member-avatar ${className || ""}`} />;
  }

  return <Web3Avatar avatar={addressInfo.avatar} className={`member-avatar ${className || ""}`} />;
}

function UsernameFromAddress({ address }: { address: string }) {
  const { data: addressInfo } = useGetAddressInfo(address, false, !!address);

  if (!addressInfo?.username) {
    return <span>{address}</span>;
  }

  return <Web3Username username={addressInfo.username} />;
}

interface MemberCardFormProps extends MemberCardProps {
  memberTagsRaw: string[][];
  setMemberTagsRaw: React.Dispatch<React.SetStateAction<string[][]>>;
  memberTags: TagCategory[];
}

function MemberCardForm({
  member,
  memberTagsRaw,
  setMemberTagsRaw,
  memberTags,
}: MemberCardFormProps) {
  const { data: addressInfo } = useGetAddressInfo(member.id, false, !!member.id);
  const { data: privateInfo } = useGetAddressPrivateInfo(member.id, !!member.id);

  const handleTagChange = (index: number, newValue: string[]) => {
    const newTagsRaw = [...memberTagsRaw];
    newTagsRaw[index] = newValue;
    setMemberTagsRaw(newTagsRaw);
  };

  return (
    <>
      <div className="member-row">
        <div className="user">
          <AvatarFromAddress address={member.id} />
          <div className="username">
            <h6>
              <UsernameFromAddress address={member.id} />
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
        <Input
          name="name"
          placeholder="John Doe"
          className="text-inpt"
          type="text"
          resetValue={privateInfo?.name || ""}
        />

        <label className="label">Title</label>
        <Input
          name="title"
          placeholder="Songwriter"
          className="text-inpt"
          type="text"
          resetValue={addressInfo?.title || ""}
        />

        <label className="label">Twitter</label>
        <Input
          name="twitterHandle"
          placeholder="@handle"
          pattern="^@(\w){1,15}$"
          className="text-inpt"
          type="text"
          resetValue={privateInfo?.twitterHandle || ""}
        />

        <label className="label">Email</label>
        <Input
          name="email"
          placeholder="name@domain.com"
          className="text-inpt"
          type="email"
          resetValue={privateInfo?.email || ""}
        />

        {memberTags.map((tag, i) => (
          <div key={i} className="tag-select">
            <label className="label">{tag.name}</label>
            <MultiSelect
              value={memberTagsRaw[i] || []}
              options={tag.options || []}
              onChange={(newValue) => handleTagChange(i, newValue)}
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
    </>
  );
}

export default function MemberCard({ member }: MemberCardProps) {
  const [memberTagsRaw, setMemberTagsRaw] = useState<string[][]>([]);

  const { data: settingsDoc } = useGetSettings();
  const { data: addressInfo } = useGetAddressInfo(member.id, false, !!member.id);

  const memberTags = useMemo<TagCategory[]>(() => {
    return (settingsDoc?.availableMemberTags as TagCategory[] | undefined) || [];
  }, [settingsDoc]);

  const encodeTag = (cat: string, value: string): string => {
    const cleanCat = kebabCase(String(cat).trim());
    const cleanVal = kebabCase(String(value).trim());
    return `${cleanCat}:${cleanVal}`;
  };

  const decodeTag = (tag: string): { name: string; value: string } => {
    const parts = tag.split(":");
    if (parts.length !== 2) return { name: "", value: "" };
    return { name: parts[0], value: parts[1] };
  };

  const memberTagsFormatted = useMemo(() => {
    return memberTags.reduce((agg, group, i) => {
      const cat = group.name;
      (memberTagsRaw[i] || []).forEach((tag) => {
        agg.push(encodeTag(cat, tag));
      });
      return agg;
    }, [] as string[]);
  }, [memberTags, memberTagsRaw]);

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

  const handleSave = (formValues: z.infer<typeof memberCardSchema>) => {
    const address = member.id;

    patchAddress(
      {
        address,
        title: formValues.title || undefined,
        tags: memberTagsFormatted.length > 0 ? memberTagsFormatted : undefined,
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
  };

  const defaultValues = useMemo(() => {
    return {
      isPublic: false,
      name: "",
      title: "",
      twitterHandle: "",
      email: "",
    };
  }, []);

  if (!member?.id) {
    return null;
  }

  return (
    <Form
      schema={memberCardSchema}
      handleSubmit={handleSave}
      className="member-card"
      defaultValues={defaultValues}>
      <MemberCardForm
        member={member}
        memberTagsRaw={memberTagsRaw}
        setMemberTagsRaw={setMemberTagsRaw}
        memberTags={memberTags}
      />
    </Form>
  );
}
