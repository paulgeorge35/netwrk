export function highlightText(text: string, highlight: string) {
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {' '}
      {parts.map((part, i) => (
        <span
          key={i}
          style={
            part.toLowerCase() === highlight.toLowerCase()
              ? { fontWeight: 'bold', textDecoration: 'underline' }
              : {}
          }
        >
          {part}
        </span>
      ))}{' '}
    </span>
  );
}

export type PickAndFlatten<T> = {
  [K in keyof T]: T[K];
} & unknown;
