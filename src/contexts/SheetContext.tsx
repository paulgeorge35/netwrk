import { createContext, useEffect, useState } from 'react';

export const SheetContext = createContext({
  contact: {
    isOpen: false,
    setIsOpen: (_: boolean) => console.log('setIsOpen'),
    id: undefined,
    setId: (_: string | undefined) => console.log('setId'),
  },
} as {
  contact: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    id?: string;
    setId: (id?: string) => void;
  };
});

export const SidebarContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpenContact, setIsOpenContact] = useState(true);
  const [contactId, setContactId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsOpenContact(!!contactId);
  }, [contactId]);

  useEffect(() => {
    if (!isOpenContact) setTimeout(() => setContactId(undefined), 300);
  }, [isOpenContact]);

  const value = {
    contact: {
      isOpen: isOpenContact,
      setIsOpen: setIsOpenContact,
      id: contactId,
      setId: setContactId,
    },
  };
  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
};
