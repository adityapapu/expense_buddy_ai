import { Button } from "@nextui-org/button";
import { FaMoneyBill } from "react-icons/fa";

export default function Page() {
  return (
    <div>
      <Button color="success" endContent={<FaMoneyBill />}>
        Add a new record
      </Button>
    </div>
  );
}
