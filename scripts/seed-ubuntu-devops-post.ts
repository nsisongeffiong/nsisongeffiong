/**
 * Seed script — inserts the Ubuntu DevOps setup post
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-ubuntu-devops-post.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const post = {
  type: 'tech' as const,
  title: 'My Ubuntu Setup for DevOps Engineering',
  slug: 'ubuntu-devops-setup',
  excerpt: 'Every tool in my Ubuntu DevOps environment, from CLI essentials to cloud CLIs, and why each one earned a place on the machine.',
  tags: ['ubuntu', 'devops', 'linux', 'docker', 'kubernetes', 'terraform', 'ansible', 'aws', 'azure', 'gcp'],
  published: true,
  publishedAt: new Date('2026-04-22'),
  metadata: {
    readTime: 12,
    featured: true,
    codeLanguages: ['bash'],
    legacyDisqus: false,
  },
  content: `<p>You get a new machine — or you nuke an old one — and you have maybe two hours before you need it operational. No time to deliberate. No time to read twelve blog posts and compare options. You need the list, and you need to know it works.</p>

<p>This is mine. Every tool here runs on my Ubuntu machine right now. I'll tell you what each one does and how to get it, but I won't pretend the install commands are interesting. The list is the thing.</p>

<hr />

<h2>Before anything else</h2>

<p>Update the system. Do this first, every time, without exception:</p>

<pre><code class="language-bash">sudo apt update &amp;&amp; sudo apt upgrade -y</code></pre>

<hr />

<h2>Command Line Tools</h2>

<h3>curl</h3>

<p>You'll use <code>curl</code> to pull down installer scripts, test APIs, and check endpoints. It comes pre-installed on most Ubuntu distributions, but confirm it:</p>

<pre><code class="language-bash">curl --version</code></pre>

<p>If it's missing:</p>

<pre><code class="language-bash">sudo apt install curl -y</code></pre>

<h3>vim</h3>

<p>My terminal editor. Muscle memory at this point. If you're a <code>nano</code> person, that's fine. But when you're SSHed into a server at 11pm and something needs editing, you want a capable editor under your fingers.</p>

<pre><code class="language-bash">sudo apt install vim -y</code></pre>

<h3>nala</h3>

<p><code>nala</code> is a frontend for <code>apt</code> that makes package operations faster and reads better. Parallel downloads, cleaner output, transaction history. I stopped using <code>apt</code> directly once I found it.</p>

<pre><code class="language-bash">sudo apt install nala -y</code></pre>

<p>After that, <code>nala install</code>, <code>nala update</code>, <code>nala upgrade</code> replace the <code>apt</code> equivalents.</p>

<h3>git</h3>

<p>Version control is the foundation everything else sits on. If it's not installed, nothing else matters.</p>

<pre><code class="language-bash">sudo apt install git -y</code></pre>

<p>Configure it immediately after install:</p>

<pre><code class="language-bash">git config --global user.name "Your Name"
git config --global user.email "you@example.com"</code></pre>

<h3>terminator</h3>

<p>Ubuntu's default terminal is fine. Terminator is better. Split panes, grouped typing, profiles. When you're running a Terraform plan in one pane, watching logs in another, and SSHed into a box in a third, you'll understand why it matters.</p>

<pre><code class="language-bash">sudo apt install terminator -y</code></pre>

<h3>Oh My Zsh</h3>

<p>Zsh with Oh My Zsh for autocompletion, plugins, and a prompt that tells you the git branch you're on. The setup takes ten minutes and pays back daily.</p>

<p>Install zsh first:</p>

<pre><code class="language-bash">sudo apt install zsh -y</code></pre>

<p>Then install Oh My Zsh:</p>

<pre><code class="language-bash">sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"</code></pre>

<p>Set zsh as your default shell when prompted, or run <code>chsh -s $(which zsh)</code> afterward.</p>

<hr />

<h2>Development Tools</h2>

<h3>VS Code</h3>

<p>My primary editor for everything that isn't a quick terminal fix. The extension ecosystem is what makes it: remote SSH, Docker, Kubernetes, Terraform, Python, YAML lint. Add what you need as you go.</p>

<p>Download the <code>.deb</code> package from <a href="https://code.visualstudio.com">code.visualstudio.com</a> and install:</p>

<pre><code class="language-bash">sudo dpkg -i code_*.deb
sudo apt install -f</code></pre>

<p>Or use the official Microsoft repo for managed updates:</p>

<pre><code class="language-bash">wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor &gt; packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" &gt; /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code -y</code></pre>

<h3>Postman</h3>

<p>API development and testing. I use it for exploring endpoints during development, writing test suites for REST APIs, and sharing collections with the team.</p>

<pre><code class="language-bash">sudo snap install postman</code></pre>

<hr />

<h2>Browsers</h2>

<h3>Microsoft Edge</h3>

<pre><code class="language-bash">curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor &gt; microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" &gt; /etc/apt/sources.list.d/microsoft-edge.list'
sudo apt update
sudo apt install microsoft-edge-stable -y</code></pre>

<h3>Chrome</h3>

<pre><code class="language-bash">wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt install -f -y</code></pre>

<hr />

<h2>Containerization and Virtualization</h2>

<h3>Docker</h3>

<p>Docker changed how I work with environments permanently. No more "works on my machine." No more dependency hell. Every service in its own container, reproducible from a single <code>docker-compose.yml</code>.</p>

<p>Remove any old versions first:</p>

<pre><code class="language-bash">sudo apt remove docker docker-engine docker.io containerd runc</code></pre>

<p>Install via the official Docker repo:</p>

<pre><code class="language-bash">sudo apt install ca-certificates curl gnupg lsb-release -y
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /tmp/docker.gpg
gpg --dearmor -o /etc/apt/keyrings/docker.gpg &lt; /tmp/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list &gt; /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y</code></pre>

<p>Add your user to the docker group so you're not prefixing every command with <code>sudo</code>:</p>

<pre><code class="language-bash">sudo usermod -aG docker $USER
newgrp docker</code></pre>

<h3>VirtualBox</h3>

<p>For full VM workloads: testing OS configurations, running Windows environments, validating Vagrant boxes. Docker handles most things, but sometimes you need the whole machine.</p>

<pre><code class="language-bash">sudo apt install virtualbox -y</code></pre>

<p>Or grab the latest version from <a href="https://www.virtualbox.org/wiki/Linux_Downloads">virtualbox.org/wiki/Linux_Downloads</a> for more recent releases.</p>

<h3>Vagrant</h3>

<p>Vagrant sits on top of VirtualBox and gives you reproducible VM environments via a <code>Vagrantfile</code>. Define the box, the network config, the provisioning script. Anyone on the team can spin up the same environment.</p>

<pre><code class="language-bash">wget https://releases.hashicorp.com/vagrant/2.4.1/vagrant_2.4.1-1_amd64.deb
sudo dpkg -i vagrant_2.4.1-1_amd64.deb</code></pre>

<p>Check <a href="https://releases.hashicorp.com/vagrant/">releases.hashicorp.com/vagrant</a> for the current version before downloading.</p>

<hr />

<h2>Cloud Services and Infrastructure</h2>

<h3>AWS CLI</h3>

<p>If you work with AWS, you need this. Configure it once with your credentials and region and you have programmatic access to everything: S3, EC2, ECS, Lambda, IAM, the lot.</p>

<pre><code class="language-bash">curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install</code></pre>

<p>Then configure:</p>

<pre><code class="language-bash">aws configure</code></pre>

<h3>Azure CLI</h3>

<p>Same principle for Azure. The <code>az</code> command covers resource groups, VMs, AKS clusters, storage accounts, and every other Azure resource.</p>

<pre><code class="language-bash">curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash</code></pre>

<pre><code class="language-bash">az login</code></pre>

<h3>gcloud CLI</h3>

<p>For Google Cloud Platform. GKE, Cloud Run, Cloud Storage, BigQuery — all reachable from <code>gcloud</code>.</p>

<pre><code class="language-bash">curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init</code></pre>

<h3>Terraform</h3>

<p>Infrastructure as code. I define resources in <code>.tf</code> files, run <code>terraform plan</code> to see what will change, and <code>terraform apply</code> to make it happen. The state file tracks what's deployed. Teams that don't use IaC eventually end up with infrastructure nobody fully understands.</p>

<pre><code class="language-bash">wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update &amp;&amp; sudo apt install terraform -y</code></pre>

<h3>kubectl</h3>

<p>The Kubernetes command-line tool. You'll use it for everything: deploying workloads, inspecting pods, scaling deployments, reading logs, exec-ing into containers.</p>

<pre><code class="language-bash">curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl</code></pre>

<hr />

<h2>Configuration Management and Automation</h2>

<h3>Ansible</h3>

<p>Agentless configuration management. You write playbooks in YAML that describe the desired state of your servers, point Ansible at an inventory file, and it SSHes into each host and makes it so. No agent to install. No daemon to manage.</p>

<pre><code class="language-bash">sudo apt install ansible -y</code></pre>

<p>Or install the latest version via pip for more control:</p>

<pre><code class="language-bash">pip install ansible</code></pre>

<h3>Jenkins</h3>

<p>CI/CD automation. Jenkins picks up code changes, runs builds, executes tests, and handles deployments. It's been around long enough to have integrations for almost everything.</p>

<pre><code class="language-bash">curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc &gt; /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list &gt; /dev/null
sudo apt update
sudo apt install jenkins -y</code></pre>

<p>Jenkins runs on port 8080 by default. Get the initial admin password from:</p>

<pre><code class="language-bash">sudo cat /var/lib/jenkins/secrets/initialAdminPassword</code></pre>

<hr />

<h2>Networking and Security</h2>

<h3>Wireshark</h3>

<p>Network protocol analyzer. When something is wrong at the network level — a service not responding, unexpected traffic, a TLS handshake failing — Wireshark shows you the actual packets. The GUI version runs on Ubuntu with no issue.</p>

<pre><code class="language-bash">sudo apt install wireshark -y</code></pre>

<p>When prompted whether non-superusers should be able to capture packets, select yes. Then add yourself to the <code>wireshark</code> group:</p>

<pre><code class="language-bash">sudo usermod -aG wireshark $USER</code></pre>

<p>Log out and back in for the group change to take effect.</p>

<hr />

<h2>Programming Languages</h2>

<h3>Python</h3>

<p>Python ships with Ubuntu, but the version matters. Check what you have:</p>

<pre><code class="language-bash">python3 --version</code></pre>

<p>Install <code>pip</code> and <code>venv</code> if they're missing:</p>

<pre><code class="language-bash">sudo apt install python3-pip python3-venv -y</code></pre>

<p>For projects, always work inside a virtual environment:</p>

<pre><code class="language-bash">python3 -m venv .venv
source .venv/bin/activate</code></pre>

<p>This keeps project dependencies isolated from system Python and from each other. The discipline saves you the dependency conflict debugging session you'd otherwise have at the worst possible moment.</p>

<hr />

<h2>Done</h2>

<p>The next step is making this reproducible. A shell script that runs all of this unattended is worth the hour it takes to write. You won't always have two hours when you need a new machine. Sometimes you'll have twenty minutes.</p>

<p>I'll cover the automation script in a follow-up post.</p>`,
}

async function seed() {
  console.log(`Seeding post: "${post.title}"`)

  try {
    await db.insert(posts).values(post)
    console.log(`  ✓ Inserted: "${post.title}"`)
  } catch (error: any) {
    if (error?.code === '23505') {
      console.log(`  ↷ Already exists: "${post.title}" — skipping`)
    } else {
      console.error(`  ✗ Failed: "${post.title}"`, error.message)
    }
  }

  process.exit(0)
}

seed()
