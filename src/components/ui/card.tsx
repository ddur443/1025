import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

// Bulletin Board Component
export interface BulletinBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  updates: Update[];
  onPostUpdate: (update: Update) => void;
}

export interface Update {
  id: string;
  user: string;
  content: string;
  skills: string[];
  teamSize: number;
  compensation: string;
  equity: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  user: string;
  content: string;
}

const BulletinBoard: React.FC<BulletinBoardProps> = ({ updates, onPostUpdate, ...props }) => {
  const [newUpdate, setNewUpdate] = React.useState<Update>({
    id: '',
    user: '',
    content: '',
    skills: [],
    teamSize: 0,
    compensation: '',
    equity: '',
    comments: []
  });

  const handlePostUpdate = () => {
    onPostUpdate({ ...newUpdate, id: Date.now().toString() });
    setNewUpdate({
      id: '',
      user: '',
      content: '',
      skills: [],
      teamSize: 0,
      compensation: '',
      equity: '',
      comments: []
    });
  };

  return (
    <div {...props}>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Bulletin Board</h2>
        <div className="space-y-2">
          <Input
            placeholder="User"
            value={newUpdate.user}
            onChange={(e) => setNewUpdate({ ...newUpdate, user: e.target.value })}
          />
          <Input
            placeholder="Content"
            value={newUpdate.content}
            onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
          />
          <Input
            placeholder="Skills"
            value={newUpdate.skills.join(', ')}
            onChange={(e) => setNewUpdate({ ...newUpdate, skills: e.target.value.split(', ') })}
          />
          <Input
            placeholder="Team Size"
            type="number"
            value={newUpdate.teamSize}
            onChange={(e) => setNewUpdate({ ...newUpdate, teamSize: parseInt(e.target.value) })}
          />
          <Input
            placeholder="Compensation"
            value={newUpdate.compensation}
            onChange={(e) => setNewUpdate({ ...newUpdate, compensation: e.target.value })}
          />
          <Input
            placeholder="Equity"
            value={newUpdate.equity}
            onChange={(e) => setNewUpdate({ ...newUpdate, equity: e.target.value })}
          />
          <Button onClick={handlePostUpdate}>Post Update</Button>
        </div>
      </div>
      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardHeader>
              <h3 className="text-lg font-semibold">{update.user}</h3>
              <p>{update.content}</p>
              <div className="text-sm text-gray-500">
                <p>Skills: {update.skills.join(', ')}</p>
                <p>Team Size: {update.teamSize}</p>
                <p>Compensation: {update.compensation}</p>
                <p>Equity: {update.equity}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {update.comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <p className="font-semibold">{comment.user}</p>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Form to input data for the new node
export interface NodeFormProps {
  onSubmit: (data: NodeData) => void;
}

export interface NodeData {
  id: string;
  label: string;
  description: string;
  type: string;
}

const NodeForm: React.FC<NodeFormProps> = ({ onSubmit }) => {
  const [nodeData, setNodeData] = React.useState<NodeData>({
    id: '',
    label: '',
    description: '',
    type: ''
  });

  const handleSubmit = () => {
    onSubmit(nodeData);
    setNodeData({
      id: '',
      label: '',
      description: '',
      type: ''
    });
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Node ID"
        value={nodeData.id}
        onChange={(e) => setNodeData({ ...nodeData, id: e.target.value })}
      />
      <Input
        placeholder="Label"
        value={nodeData.label}
        onChange={(e) => setNodeData({ ...nodeData, label: e.target.value })}
      />
      <Input
        placeholder="Description"
        value={nodeData.description}
        onChange={(e) => setNodeData({ ...nodeData, description: e.target.value })}
      />
      <Input
        placeholder="Type"
        value={nodeData.type}
        onChange={(e) => setNodeData({ ...nodeData, type: e.target.value })}
      />
      <Button onClick={handleSubmit}>Add Node</Button>
    </div>
  );
};

export { Card, CardHeader, CardContent, BulletinBoard, NodeForm }
