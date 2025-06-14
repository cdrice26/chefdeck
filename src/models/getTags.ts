import { OptionType } from '@/components/forms/TagSelector';
import DBTag from '@/types/db/DBTag';

const getTags = (tags: DBTag[]): OptionType[] =>
  tags.map((tag) => ({
    value: tag.name,
    label: tag.name
  }));

export default getTags;
