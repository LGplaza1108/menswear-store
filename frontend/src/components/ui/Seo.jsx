import { Helmet } from "react-helmet-async";

const Seo = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | Menswear Store` : "Menswear Store"}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export default Seo;
