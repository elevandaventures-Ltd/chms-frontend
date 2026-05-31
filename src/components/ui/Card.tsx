type CardProps = {
  title: string;
  children?: React.ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </article>
  );
}

export default Card;
