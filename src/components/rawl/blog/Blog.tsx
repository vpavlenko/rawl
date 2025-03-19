import React from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import ChordStairs from "../legends/ChordStairs";
import { BLOG_POSTS } from "./blogPosts";

// Styled components for the blog
const BlogContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: #fff;
  position: relative;
`;

const BlogTitle = styled.h1`
  color: #fff;
  margin-bottom: 30px;
`;

const BlogPostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

// Define BlogPostTitle before using it in BlogPostPreview
const BlogPostTitle = styled.div`
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  width: 80%;
  text-align: left;
`;

// Updated BlogPostPreview to use column layout
const BlogPostPreview = styled(Link)`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5em;
  text-decoration: none;
  color: inherit;

  &:hover {
    ${BlogPostTitle} {
      color: #ffffff;
    }
  }
`;

// New container for the title row with two columns
const TitleRow = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 8px;
`;

// Modified BlogPostChords to be outside the link and playable
const BlogPostChords = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 20%;
  padding-right: 15px;
  cursor: pointer;
`;

// Updated BlogPostDate to go under the title and be left-aligned
const BlogPostDate = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: 100;
  margin-top: 7px;
`;

const BlogPostContent = styled.div`
  line-height: 1.6;
  color: #fff;
`;

const BackToList = styled(Link)`
  display: inline-block;
  color: #fff;
  margin-bottom: 20px;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const BlogPostContainer = styled.div`
  margin-bottom: 200px;
`;

// Updated date sidebar component to include date and chords in a column
const BlogPostDateSidebar = styled.div`
  position: absolute;
  left: -150px;
  top: 0;
  color: #aaa;
  font-size: 0.9rem;
  width: 120px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
`;

const SidebarDate = styled.div`
  width: 100%;
`;

// Updated SidebarChords to be clickable
const SidebarChords = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
`;

// New wrapper for title to provide positioning context
const TitleContainer = styled.div`
  position: relative;
`;

// Utility function to format dates
const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Blog component
const Blog: React.FC = () => {
  const { postId } = useParams<{ postId?: string }>();

  // If postId is provided, show that post, otherwise show the index
  if (postId) {
    const id = parseInt(postId, 10);
    const post = BLOG_POSTS.find((post) => post.id === id);

    if (!post) {
      return (
        <BlogContainer>
          <BackToList to="/blog">← Back to all posts</BackToList>
          <BlogTitle>Post Not Found</BlogTitle>
          <p>The requested blog post could not be found.</p>
        </BlogContainer>
      );
    }

    return (
      <BlogContainer>
        <BackToList to="/blog">← Back to all posts</BackToList>
        <TitleContainer>
          <BlogPostDateSidebar>
            <SidebarDate>{formatDisplayDate(post.date)}</SidebarDate>
            {post.titleChords && (
              <SidebarChords>
                <ChordStairs
                  mode={{ title: "", chords: post.titleChords }}
                  scale={0.85}
                  playbackMode="together"
                />
              </SidebarChords>
            )}
          </BlogPostDateSidebar>
          <BlogTitle>{post.title}</BlogTitle>
        </TitleContainer>
        <BlogPostContainer>
          <BlogPostContent>{post.content()}</BlogPostContent>
        </BlogPostContainer>
      </BlogContainer>
    );
  }

  // Sort posts by date (newest first)
  const sortedPosts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <BlogContainer>
      <BlogTitle>Structures and Styles in Western Music</BlogTitle>
      <BlogPostList>
        {sortedPosts.map((post) => (
          <div key={post.id} style={{ display: "flex", marginBottom: "1.5em" }}>
            {post.titleChords && (
              <BlogPostChords>
                <ChordStairs
                  mode={{ title: "", chords: post.titleChords }}
                  scale={0.85}
                  playbackMode="together"
                />
              </BlogPostChords>
            )}
            <BlogPostPreview to={`/blog/${post.id}`}>
              <TitleRow>
                <BlogPostTitle>
                  {post.title}
                  <BlogPostDate>{formatDisplayDate(post.date)}</BlogPostDate>
                </BlogPostTitle>
              </TitleRow>
            </BlogPostPreview>
          </div>
        ))}
      </BlogPostList>
    </BlogContainer>
  );
};

export default Blog;
