import React from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { BLOG_POSTS } from "./blogPosts";

// Styled components for the blog
const BlogContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: #fff;
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

const BlogPostPreview = styled.div`
  padding: 15px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BlogPostTitle = styled(Link)`
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  margin-bottom: 8px;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

const BlogPostDate = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const BlogPostExcerpt = styled.div`
  color: #ddd;
  line-height: 1.5;
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
  const history = useHistory();

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
        <BlogTitle>{post.title}</BlogTitle>
        <BlogPostDate>{formatDisplayDate(post.date)}</BlogPostDate>
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
      <BlogTitle>Music Theory Blog</BlogTitle>
      <BlogPostList>
        {sortedPosts.map((post) => (
          <BlogPostPreview key={post.id}>
            <BlogPostTitle to={`/blog/${post.id}`}>{post.title}</BlogPostTitle>
            <BlogPostDate>{formatDisplayDate(post.date)}</BlogPostDate>
            <BlogPostExcerpt>
              {post.excerpt || post.content().props.children[0].props.children}
            </BlogPostExcerpt>
          </BlogPostPreview>
        ))}
      </BlogPostList>
    </BlogContainer>
  );
};

export default Blog;
