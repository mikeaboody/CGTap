class CreateModel < ActiveRecord::Migration
  def up
    create_table :time_sheets do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.integer :submission_time
      t.integer :hours
    end
  end
 
  def down
    drop_table :time_sheets
  end
end