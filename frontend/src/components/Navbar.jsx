export default function ({back}) {
  const handleClick = () => {
    back();
  }
  return (
    <header>
      <nav>
        <div>
          <button onClick={handleClick}> disconnect </button>
        </div>
      </nav>
    </header>
  );
}
