import { OptionType } from '@/components/forms/TagSelector';
import DBTag from '@/types/db/DBTag';

const getTags = (tags: DBTag[]): OptionType[] =>
  tags.map((tag) => ({
    value: tag.tag_name,
    label: tag.tag_name
  }));

export default getTags;
