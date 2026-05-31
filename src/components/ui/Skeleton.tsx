type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  radius?: number;
};

export function Skeleton({ width = '100%', height = 16, radius = 8 }: SkeletonProps) {
  return <div className="ui-skeleton" style={{ width, height, borderRadius: radius }} />;
}

export default Skeleton;
