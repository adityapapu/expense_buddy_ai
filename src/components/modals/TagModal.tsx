"use client";

import React, { useCallback, useState, useEffect } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  useDisclosure
} from "@heroui/react";
import { useToast } from "@/hooks/use-toast";
import { type Tag } from "@prisma/client";
import { createTag, updateTag } from "@/server/services/tagService";
import { TwitterPicker } from 'react-color';

interface TagModalProps {
  tag?: Tag;
  isOpen?: boolean;
  onClose?: () => void;
  onTagCreated?: () => void;
  onTagUpdated?: () => void;
}

export default function TagModal({ 
  tag, 
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onTagCreated,
  onTagUpdated 
}: TagModalProps) {
  const { toast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure({
    isOpen: externalIsOpen,
    onClose: externalOnClose
  });

  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    }
  }, [tag, isOpen]);

  const resetForm = useCallback(() => {
    setName("");
    setColor(null);
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      onClose();
    }
    resetForm();
  }, [externalOnClose, onClose, resetForm]);

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    if (!name.trim()) {
      formErrors.name = "Tag name is required";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let response;

      if (tag) {
        // Update existing tag
        response = await updateTag({
          id: tag.id,
          name,
          color: color ?? undefined
        });
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Tag updated successfully."
          });
          handleClose();
          onTagUpdated?.();
        }
      } else {
        // Create new tag
        response = await createTag({
          name,
          color: color ?? undefined
        });
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Tag created successfully."
          });
          resetForm();
          if (!externalIsOpen) handleClose();
          onTagCreated?.();
        }
      }

      if (!response.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message ?? "An error occurred."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModalTrigger = () => {
    if (externalIsOpen !== undefined) return null;
    
    return (
      <Button color="primary" onPress={onOpen}>
        Create Tag
      </Button>
    );
  };

  return (
    <>
      {renderModalTrigger()}
      
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(_onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {tag ? "Edit Tag" : "Create New Tag"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Enter tag name"
                  value={name}
                  onValueChange={setName}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  isRequired
                />
                
                <div className="mt-4">
                  <p className="text-small mb-2">Tag Color</p>
                  <TwitterPicker 
                    color={color ?? '#4285F4'}
                    onChange={(color) => setColor(color.hex)}
                    triangle="hide"
                    width="100%"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={handleClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                >
                  {tag ? "Save" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}