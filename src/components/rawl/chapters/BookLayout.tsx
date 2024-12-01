import * as React from "react";
import styled from "styled-components";

const BookContainer = styled.div`
  width: 95%;
  padding: 20px;
  color: #ddd;
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
