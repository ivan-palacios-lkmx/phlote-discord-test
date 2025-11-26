"use client";

import AdminToggle from "@/components/admin/AdminToggle/AdminToggle";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetSettings } from "@/hooks/query/query-hooks/use-get-settings";
import useTags from "@/hooks/useTags";
import { AddressDocWithID } from "@/types/database";
import { useState } from "react";

import "./MemberCard.scss";

interface MemberCardProps {
  member: AddressDocWithID;
}

interface MultiselectProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  closeOnSelect?: boolean;
}

function Multiselect({
  value,
  options,
  onChange,
  multiple = true,
  closeOnSelect = false,
}: MultiselectProps) {
  // TODO: Implement Multiselect component (or use a library like react-select)
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (multiple) {
      if (value.includes(option)) {
        onChange(value.filter((v) => v !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      onChange([option]);
      if (closeOnSelect) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="multiselect">
      <div className="multiselect__tags" onClick={() => setIsOpen(!isOpen)}>
        {value.length > 0 ? (
          <div className="multiselect__tags-wrap">
            {value.map((v) => (
              <span key={v} className="multiselect__tag">
                {v}
                <i
                  className="multiselect__tag-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((item) => item !== v));
                  }}>
                  ×
                </i>
              </span>
            ))}
          </div>
        ) : (
          <span className="multiselect__placeholder">Select options</span>
        )}
        <div className="multiselect__select">▼</div>
      </div>
      {isOpen && (
        <div className="multiselect__content">
          {options.map((option) => (
            <div
              key={option}
              className={`multiselect__option ${value.includes(option) ? "multiselect__option--selected" : ""}`}
              onClick={() => toggleOption(option)}>
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

export default function MemberCard({ member }: MemberCardProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [twitter, setTwitter] = useState("");
  const [email, setEmail] = useState("");
  const [memberTagsRaw, setMemberTagsRaw] = useState<string[][]>([]);

  const { memberTags } = useTags();

  const { data: settingsDoc } = useGetSettings();

  // const memberTagsFormatted = useMemo(() => {
  //   return memberTags.reduce((agg, group, i) => {
  //     const cat = group.name;
  //     (memberTagsRaw[i] || []).forEach((tag) => {
  //       agg.push(encodeTag(cat, tag));
  //     });
  //     return agg;
  //   }, [] as string[]);
  // }, [memberTags, memberTagsRaw, encodeTag]);

  // const existingMemberTags = useMemo(() => {
  //   return (settingsDoc && member?.tags) || [];
  // }, [settingsDoc, member?.tags]);

  // TODO: this tag decoding and expiration logic should be implemented without the useTags hook
  // useEffect(() => {
  //   if (!memberTags.length) return;

  //   const newTagsRaw = memberTags.map(() => [] as string[]);
  //   (existingMemberTags as string[]).forEach((tag) => {
  //     const { name: tagName, value: tagValue } = decodeTag(tag);
  //     const groupIdx = memberTags.findIndex((group) => group.name === tagName);
  //     if (groupIdx >= 0 && newTagsRaw[groupIdx]) {
  //       newTagsRaw[groupIdx].push(tagValue);
  //     }
  //   });
  //   setMemberTagsRaw(newTagsRaw);
  // }, [existingMemberTags, memberTags, decodeTag]);

  const handleTagChange = (index: number, newValue: string[]) => {
    const newTagsRaw = [...memberTagsRaw];
    newTagsRaw[index] = newValue;
    setMemberTagsRaw(newTagsRaw);
  };

  const handleSave = async () => {};

  if (!member?.id) {
    return null;
  }

  return (
    <form onSubmit={handleSave} className="member-card">
      <div className="member-row">
        <div className="user">
          <AvatarFromAddress address={member.id} />
          <div className="username">
            <h6>
              <UsernameFromAddress address={member.id} />
            </h6>
            <span className="subtext">{isPublic ? "Public" : "Private"}</span>
          </div>
        </div>
        <div className="private-toggle">
          <AdminToggle checked={isPublic} onChange={setIsPublic} />
        </div>
      </div>

      <div className="inputs">
        <label className="label">Name</label>
        <input
          placeholder="John Doe"
          className="text-inpt"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Title</label>
        <input
          placeholder="Songwriter"
          className="text-inpt"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label">Twitter</label>
        <input
          placeholder="@handle"
          pattern="^@(\w){1,15}$"
          className="text-inpt"
          type="text"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
        />

        <label className="label">Email</label>
        <input
          placeholder="name@domain.com"
          className="text-inpt"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {memberTags.map((tag, i) => (
          <div key={i} className="tag-select">
            <label className="label">{tag.name}</label>
            <Multiselect
              value={memberTagsRaw[i] || []}
              options={tag.options || []}
              onChange={(newValue) => handleTagChange(i, newValue)}
              multiple
              searchable={false}
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
    </form>
  );
}
