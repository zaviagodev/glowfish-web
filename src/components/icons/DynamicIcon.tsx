interface DynamicIconProps {
  icon: any;
  className?: string;
  style?: React.CSSProperties;
}

const DynamicIcon = ({ icon: Icon, className, style }: DynamicIconProps) => (
  <Icon className={className} style={style} />
);

export default DynamicIcon; 