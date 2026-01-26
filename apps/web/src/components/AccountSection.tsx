import { Card } from 'chefdeck-shared';

interface SectionProps {
  children: React.ReactNode;
  name: string;
  onFormSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Section = ({ children, name, onFormSubmit }: SectionProps) => (
  <Card className="w-[95%] sm:w-1/2 p-4 flex flex-col gap-4">
    <h1 className="text-xl font-semibold">{name}</h1>
    <form className="flex flex-col gap-4" onSubmit={onFormSubmit}>
      {children}
    </form>
  </Card>
);

export default Section;
