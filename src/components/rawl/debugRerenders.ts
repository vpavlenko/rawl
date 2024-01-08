function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}

export const areEqual = (prevProps, nextProps) => {
  // Compare all keys in previous and next props
  Object.keys(prevProps).forEach((key) => {
    if (prevProps[key] !== nextProps[key]) {
      console.log(`Prop '${key}' changed:`, {
        from: prevProps[key],
        to: nextProps[key],
      });
    }
  });

  // Perform a deep equality check
  return shallowEqual(prevProps, nextProps);
};

// How to: drop areEqual as a second argument:
//
// React.memo(() => {}, areEqual)
