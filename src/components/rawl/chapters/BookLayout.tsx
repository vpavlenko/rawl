import * as React from "react";
import styled from "styled-components";

const BookContainer = styled.div`
  width: 100%;
  padding: 40px;
  color: #ddd;
  max-width: 1200px;
  margin: 0 auto;
`;

const BookLayout: React.FC = () => {
  const Intro = React.lazy(() => import("./Intro"));

  return (
    <BookContainer>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Intro />
      </React.Suspense>
    </BookContainer>
  );
};

export default BookLayout;
