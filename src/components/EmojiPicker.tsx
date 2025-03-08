"use client";

import React, { memo, useCallback, useState } from "react";
import EmojiPickerReact, {
  type EmojiClickData,
  Theme,
} from "emoji-picker-react";
import { Button } from "@heroui/react";

interface EmojiPickerProps {
  defaultIcon: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = memo(
  ({ defaultIcon, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string>(defaultIcon);

    const handleEmojiClick = useCallback(
      (emojiData: EmojiClickData) => {
        setSelectedEmoji(emojiData.emoji);
        setShowPicker(false);
        onChange(emojiData.emoji);
      },
      [onChange],
    );

    const togglePicker = useCallback(() => {
      setShowPicker((prev) => !prev);
    }, []);

    return (
      <div className="relative">
        <Button
          isIconOnly
          color="warning"
          variant="faded"
          aria-label="Select emoji"
          onClick={togglePicker}
        >
          <span className="text-2xl">{selectedEmoji}</span>
        </Button>
        {showPicker && (
          <div className="absolute z-10 mt-2">
            <EmojiPickerReact
              onEmojiClick={handleEmojiClick}
              skinTonesDisabled={true}
              theme={Theme.DARK}
            />
          </div>
        )}
      </div>
    );
  },
);

EmojiPicker.displayName = "EmojiPicker";

export default EmojiPicker;
