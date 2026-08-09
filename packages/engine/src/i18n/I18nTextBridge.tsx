import { PropsWithChildren, useEffect, useRef } from 'react';
import { translateStaticText } from './staticText';

const translatableAttributes = ['title', 'placeholder', 'aria-label'] as const;

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  return !parent || parent.closest('script, style, input, textarea, [contenteditable="true"]') !== null;
}

function translateTextNode(node: Text, language: string) {
  if (shouldSkipTextNode(node)) {
    return;
  }

  const value = node.nodeValue;
  if (!value) {
    return;
  }

  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? '';
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? '';
  const content = value.slice(leadingWhitespace.length, value.length - trailingWhitespace.length);
  const translated = translateStaticText(content, language);
  if (translated !== content) {
    node.nodeValue = `${leadingWhitespace}${translated}${trailingWhitespace}`;
  }
}

function translateElement(element: Element, language: string) {
  translatableAttributes.forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) {
      return;
    }

    const translated = translateStaticText(value, language);
    if (translated !== value) {
      element.setAttribute(attribute, translated);
    }
  });

  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node as Text, language);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      translateElement(node as Element, language);
    }
  });
}

type I18nTextBridgeProps = PropsWithChildren<{ language: string }>;

export function I18nTextBridge({ children, language }: I18nTextBridgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const translate = () => translateElement(root, language);
    translate();

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === 'characterData') {
          translateTextNode(record.target as Text, language);
          return;
        }

        if (record.type === 'attributes') {
          translateElement(record.target as Element, language);
          return;
        }

        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, language);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateElement(node as Element, language);
          }
        });
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: [...translatableAttributes],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
}
