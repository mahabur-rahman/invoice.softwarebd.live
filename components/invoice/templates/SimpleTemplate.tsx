import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const SimpleTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default SimpleTemplate;
