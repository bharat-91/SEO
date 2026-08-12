export const basicHtmlFixture = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="This is a test page">
  <link rel="canonical" href="https://example.com/test">
</head>
<body>
  <h1>Welcome</h1>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</body>
</html>
`;

export const navDetectionFixture = `
<!DOCTYPE html>
<html>
<head><title>Nav Test</title></head>
<body>
  <header>
    <nav>
      <a href="/home">Home</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
    <h1>Main Content</h1>
  </main>
</body>
</html>
`;

export const multipleNavFixture = `
<!DOCTYPE html>
<html>
<head><title>Multi Nav Test</title></head>
<body>
  <header>
    <nav>
      <a href="/home">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <h1>Main Content</h1>
  </main>
  <footer>
    <nav>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>
</body>
</html>
`;

export const noNavFixture = `
<!DOCTYPE html>
<html>
<head><title>No Nav Test</title></head>
<body>
  <h1>No Navigation</h1>
  <p>This page has no nav element</p>
</body>
</html>
`;

export const missingTitleFixture = `
<!DOCTYPE html>
<html>
<head>
  <meta name="description" content="Description">
</head>
<body>
  <h1>Content</h1>
</body>
</html>
`;

export const shortTitleFixture = `
<!DOCTYPE html>
<html>
<head>
  <title>Hi</title>
</head>
<body>
  <h1>Content</h1>
</body>
</html>
`;

export const longTitleFixture = `
<!DOCTYPE html>
<html>
<head>
  <title>${'A'.repeat(70)}</title>
</head>
<body>
  <h1>Content</h1>
</body>
</html>
`;

export const multipleH1Fixture = `
<!DOCTYPE html>
<html>
<head><title>Multiple H1</title></head>
<body>
  <h1>First H1</h1>
  <h1>Second H1</h1>
</body>
</html>
`;

export const noindexFixture = `
<!DOCTYPE html>
<html>
<head>
  <title>Noindex Test</title>
  <meta name="robots" content="noindex, follow">
</head>
<body>
  <h1>Content</h1>
</body>
</html>
`;
