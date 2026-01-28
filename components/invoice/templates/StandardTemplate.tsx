import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const StandardTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default StandardTemplate;
