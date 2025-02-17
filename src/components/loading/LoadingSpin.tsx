const LoadingSpin = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingSpin;
