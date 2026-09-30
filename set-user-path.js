const { execSync } = require('child_process');

try {
  // Read current user PATH
  const currentPath = execSync('powershell -Command "[Environment]::GetEnvironmentVariable(\'Path\', \'User\')"').toString().trim();
  const gitPath = 'C:\\Users\\Priyanka\\mingit\\cmd';

  if (!currentPath.includes(gitPath)) {
    const newPath = currentPath ? `${currentPath};${gitPath}` : gitPath;
    execSync(`powershell -Command "[Environment]::SetEnvironmentVariable('Path', '${newPath}', 'User')"`);
    console.log('[PATH Setup] Successfully added MinGit to User PATH!');
  } else {
    console.log('[PATH Setup] MinGit is already in User PATH.');
  }
} catch (err) {
  console.error('[PATH Setup Error]:', err.message);
}
