import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'constants/constant';

const PageTitle = ({ title }) => {
  return (
    <Helmet>
      <title>
        {APP_NAME} - {title}
      </title>
    </Helmet>
  );
};

export default PageTitle;
