import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const ProfessionalTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default ProfessionalTemplate;
