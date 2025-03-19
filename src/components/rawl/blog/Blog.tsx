import React, { useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
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
  // font-weight: 100;
  min-width: 40em;
  max-width: 100%;
  text-align: left;
  white-space: nowrap;

  @media (max-width: 768px) {
    min-width: unset;
    white-space: normal;
  }
`;

// Constants for chord visualization width calculation
const NOTE_WIDTH = 30; // From ChordStairs.tsx
const CHORD_SCALE = 0.85; // Scale factor used in the ChordStairs component
const MAX_CHORD_COUNT = Math.max(
  ...BLOG_POSTS.map((post) => post.titleChords?.length || 0),
);
const CHORD_COLUMN_WIDTH = MAX_CHORD_COUNT * NOTE_WIDTH * CHORD_SCALE;

// New BlogPostItem component to replace the inline div style
const BlogPostItem = styled.div`
  display: grid;
  grid-template-columns: ${CHORD_COLUMN_WIDTH}px 1fr;
  align-items: center;
  margin-bottom: 1.5em;
  gap: 15px;
`;

// Redefine BlogPostChords to align with grid
const BlogPostChords = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  cursor: pointer;
  width: 100%; /* Take up all available space in the column */
`;

// Updated BlogPostPreview to fit the new grid layout
const BlogPostPreview = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;

  &:hover {
    ${BlogPostTitle} {
      color: #ffffff;
    }
  }
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

// New wrapper for title to provide positioning context
const TitleContainer = styled.div`
  position: relative;
`;

// Add a new styled component for title chords
const TitleChords = styled.div`
  margin-top: 15px;
  margin-bottom: 30px;
  display: flex;
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

// Updated interface for URL parameters
interface BlogParams {
  postId?: string;
  slug?: string;
}

// Blog component
const Blog: React.FC = () => {
  const { postId, slug } = useParams<BlogParams>();
  const history = useHistory();

  // Update redirect logic to always ensure correct slug
  useEffect(() => {
    if (postId) {
      const id = parseInt(postId, 10);
      const post = BLOG_POSTS.find((p) => p.id === id);

      if (post) {
        const correctSlug = slugify(post.title);

        // Redirect if slug is missing or doesn't match the correct one
        if (!slug || slug !== correctSlug) {
          history.replace(`/blog/${postId}/${correctSlug}`);
        }
      }
    }
  }, [postId, slug, history]);

  // If postId is provided, show that post, otherwise show the index
  if (postId) {
    const id = parseInt(postId, 10);
    const post = BLOG_POSTS.find((post) => post.id === id);

    if (post) {
      return (
        <BlogContainer>
          <TitleContainer>
            <BlogPostDateSidebar>
              <SidebarDate>{formatDisplayDate(post.date)}</SidebarDate>
            </BlogPostDateSidebar>
            <BlogTitle>{post.title}</BlogTitle>
            {post.titleChords && (
              <TitleChords className="title-chords">
                <ChordStairs
                  mode={{ title: "", chords: post.titleChords }}
                  scale={2}
                  playbackMode="together"
                />
              </TitleChords>
            )}
          </TitleContainer>
          <BlogPostContainer>
            <BlogPostContent>{post.content()}</BlogPostContent>
          </BlogPostContainer>
        </BlogContainer>
      );
    }
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
          <BlogPostItem key={post.id}>
            <BlogPostChords>
              {post.titleChords && (
                <ChordStairs
                  mode={{ title: "", chords: post.titleChords }}
                  scale={0.85}
                  playbackMode="together"
                />
              )}
            </BlogPostChords>
            <BlogPostPreview to={`/blog/${post.id}/${slugify(post.title)}`}>
              <BlogPostTitle>
                {post.title}
                <BlogPostDate>{formatDisplayDate(post.date)}</BlogPostDate>
              </BlogPostTitle>
            </BlogPostPreview>
          </BlogPostItem>
        ))}
      </BlogPostList>
    </BlogContainer>
  );
};

export default Blog;
