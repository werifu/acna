export function TrumpFormater(classes: string) {
  return (text: string) => {
    return (
      text
        // English
        .replace(
          /Donald J\. Trump/g,
          `<span class="${classes}">Donald J. Trump</span>`
        )
        .replace(
          /(?<!Donald J\. )Trump/g,
          `<span class="${classes}">Trump</span>`
        )
        // Chinese
        .replace(
          /唐纳德·J·特朗普/g,
          `<span class="${classes}">唐纳德·J·特朗普</span>`
        )
        .replace(
          /(?<!唐纳德·J·)特朗普/g,
          `<span class="${classes}">特朗普</span>`
        )
        // Japanese
        .replace(
          /ドナルド・J・トランプ/g,
          `<span class="${classes}">ドナルド・J・トランプ</span>`
        )
        .replace(
          /(?<!ドナルド・J・)トランプ/g,
          `<span class="${classes}">トランプ</span>`
        )
        // Korean
        .replace(
          /도널드 J\. 트럼프/g,
          `<span class="${classes}">도널드 J. 트럼프</span>`
        )
        .replace(
          /(?<!도널드 J\. )트럼프/g,
          `<span class="${classes}">트럼프</span>`
        )
    );
  };
}
