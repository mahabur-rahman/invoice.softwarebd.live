import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const CleanTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default CleanTemplate;
