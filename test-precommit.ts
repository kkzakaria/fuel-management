// Test file to verify pre-commit hook
export function testFunction() {
  const name: string = "Transport Manager";
  console.log(name);

  // This should trigger TypeScript error (unused variable)
  const unused = "test";

  return name;
}
