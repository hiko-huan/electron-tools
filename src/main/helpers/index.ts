export const delay = (time) => {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}

export async function waitingNext(timeCheck = 1000, end): Promise<any> {
  await delay(timeCheck);
  let check = end;
  if (typeof end === 'function') {
    check = end();
  }
  if (check) {
    return check;
  }
  await waitingNext(timeCheck, end);
}

export const isImageLoaded = (imgElement: HTMLImageElement): boolean => {
  return imgElement.complete && imgElement.naturalHeight !== 0;
}
