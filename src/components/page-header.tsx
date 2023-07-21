export const PageHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <div className="flex flex-col gap-3 p-3">
    <span className="flex items-center gap-6">
      <h1>{icon}</h1>
      <h1 className="text-2xl font-bold">{title}</h1>
    </span>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);
