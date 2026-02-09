import { APP_NAME } from "../constants/constants";
import React from "react";

const PageHead = ({
  title,
  description,
  keywords,
  image,
  url,
  children,
}) => {
  return (
    <React.Fragment>
      <title>{`${APP_NAME} ${title && `- ${title}`}`}</title>

      {description && <meta name="description" content={description} />}

      {keywords && <meta name="keywords" content={keywords} />}

      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {children}
    </React.Fragment>
  );
}

export default PageHead