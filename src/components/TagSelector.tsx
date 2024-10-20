import React, {
  useState
} from 'react';
import {
  type Tag,
  TagInput
} from 'emblor';

const Example = () => {
  const tags:Tag[] = [];
  const [exampleTags, setExampleTags] = useState < Tag[] > (tags);
  const [activeTagIndex, setActiveTagIndex] = useState < number | null > (null);

  return ( <
    TagInput tags = {
      exampleTags
    }
    maxTags={6}
    setTags = {
      (newTags) => {
        setExampleTags(newTags);
      }
    }
    placeholder = "Add a tag"
    styleClasses = {
      {
        input: 'w-full sm:max-w-[350px]',
        tag: {
          body:"pl-2"
        }

      }
    }
    activeTagIndex = {
      activeTagIndex
    }
    setActiveTagIndex = {
      setActiveTagIndex
    }
    enableAutocomplete={true}
    
    // restrictTagsToAutocompleteOptions = {true}
    />
  );
};

export default Example;
