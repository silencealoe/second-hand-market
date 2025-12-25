import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import './Content.less';

interface ContentProps {
  children: React.ReactNode;
  title?: string;
}

const Content: React.FC<ContentProps> = ({ children, title }) => {
  return (
    <PageContainer ghost header={{ title }}>
      <div className="content-container">
        {children}
      </div>
    </PageContainer>
  );
};

export default Content;
