import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "@nextui-org/react";
import { EditIcon, DeleteIcon, EyeIcon } from "./icons";
import { listPaymentMethods } from "@/server/services/paymentMethodService";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  userId: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: "1", name: "Visa", icon: "🚫", userId: "user1" },
  { id: "2", name: "MasterCard", icon: "🚫", userId: "user1" },
  { id: "3", name: "PayPal", icon: "🚫", userId: "user1" },
];

interface Column {
  uid: string;
  name: string;
}

const columns: Column[] = [
  { uid: "name", name: "Name" },
  { uid: "icon", name: "Icon" },
  { uid: "actions", name: "Actions" },
];

const PaymentMethodList: React.FC = async () => {
  const paymentMethods = await listPaymentMethods();
  console.log(paymentMethods);
  const renderCell = React.useCallback(
    (method: PaymentMethod, columnKey: string) => {
      const cellValue = method[columnKey as keyof PaymentMethod];
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex items-center gap-2">
              <Tooltip content="Details">
                <span className="cursor-pointer">
                  <EyeIcon />
                </span>
              </Tooltip>
              <Tooltip content="Edit Payment Method">
                <span className="cursor-pointer">
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete Payment Method">
                <span className="cursor-pointer">
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return <>{cellValue}</>; // Use React fragment to handle the case when cellValue is JSX
      }
    },
    [],
  );

  return (
    <Table aria-label="Payment Methods Table">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={paymentMethods}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PaymentMethodList;
