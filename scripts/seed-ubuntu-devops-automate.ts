/**
 * Seed script — inserts the Ubuntu DevOps automation post
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-ubuntu-devops-automate.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const post = {
  type: 'tech' as const,
  title: 'Automating the Ubuntu DevOps Setup',
  slug: 'automating-ubuntu-devops-setup',
  excerpt: 'A single idempotent bash script that installs every tool in my DevOps environment. Safe to re-run, skips what\'s already there, takes the machine from fresh to ready in one shot.',
  tags: ['ubuntu', 'devops', 'linux', 'bash', 'automation'],
  published: true,
  publishedAt: new Date('2026-04-22'),
  metadata: {
    readTime: 8,
    featured: false,
    codeLanguages: ['bash'],
    legacyDisqus: false,
  },
  content: `<p>The last post listed every tool. This one makes the list executable.</p>

<p>Copy-pasting twenty install commands across sections works once. The second time you set up a machine — after a fresh Ubuntu install, a hardware swap, a VM you spun up for a project — you want one command. You run it, you walk away, you come back to a machine that's ready.</p>

<p>That's what this script does.</p>

<hr />

<h2>The design constraints</h2>

<p>Three rules before writing a single line:</p>

<p><strong>Idempotent.</strong> Running the script twice should produce the same result as running it once. No duplicate repo entries, no errors because a package is already installed, no blown-away config files. Safe to re-run after a partial failure.</p>

<p><strong>Transparent.</strong> Every step prints what it's doing. If something fails, you know exactly where it stopped and why.</p>

<p><strong>Ordered.</strong> Dependencies first. <code>curl</code> before anything that needs <code>curl</code>. <code>zsh</code> before Oh My Zsh. The order matters and the script encodes it.</p>

<hr />

<h2>The script</h2>

<p>Save this as <code>setup.sh</code> in your home directory.</p>

<pre><code class="language-bash">#!/usr/bin/env bash
set -euo pipefail</code></pre>

<p><code>set -euo pipefail</code> does three things: exits on any error (<code>-e</code>), treats unset variables as errors (<code>-u</code>), and catches failures in pipes (<code>-o pipefail</code>). Without it, a failed command in the middle of the script silently continues. With it, the script stops at the first sign of trouble.</p>

<pre><code class="language-bash"># ── Helpers ──────────────────────────────────────────────────────────────────

info()    { echo "[INFO]  $*"; }
success() { echo "[OK]    $*"; }
skip()    { echo "[SKIP]  $*"; }

installed() { command -v "$1" &amp;&gt;/dev/null; }</code></pre>

<p>Three print helpers and one check. <code>installed curl</code> returns true if <code>curl</code> is on the PATH. Every install block uses it to skip what's already there.</p>

<pre><code class="language-bash"># ── System update ─────────────────────────────────────────────────────────────

info "Updating package index..."
sudo apt update -qq
sudo apt upgrade -y -qq
success "System updated"</code></pre>

<pre><code class="language-bash"># ── Core CLI tools ────────────────────────────────────────────────────────────

CORE_PKGS=(curl vim git zsh nala terminator wireshark)

for pkg in "\${CORE_PKGS[@]}"; do
  if dpkg -s "$pkg" &amp;&gt;/dev/null; then
    skip "$pkg already installed"
  else
    info "Installing $pkg..."
    sudo apt install -y -qq "$pkg"
    success "$pkg installed"
  fi
done</code></pre>

<p>Loop over the core packages, check before installing, report the result. The <code>dpkg -s</code> check is more reliable than <code>installed</code> for apt packages because it queries the package database directly, not just the PATH.</p>

<pre><code class="language-bash"># ── Oh My Zsh ────────────────────────────────────────────────────────────────

if [ -d "$HOME/.oh-my-zsh" ]; then
  skip "Oh My Zsh already installed"
else
  info "Installing Oh My Zsh..."
  sh -c "\$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
  chsh -s "\$(which zsh)"
  success "Oh My Zsh installed"
fi</code></pre>

<p>The <code>--unattended</code> flag skips the interactive prompts. <code>chsh</code> sets zsh as the default shell — the change takes effect on next login.</p>

<pre><code class="language-bash"># ── Docker ───────────────────────────────────────────────────────────────────

if installed docker; then
  skip "Docker already installed"
else
  info "Installing Docker..."
  sudo apt install -y -qq ca-certificates gnupg lsb-release

  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /tmp/docker.gpg
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg &lt; /tmp/docker.gpg

  echo \\
    "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
    https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable" | \\
    sudo tee /etc/apt/sources.list.d/docker.list &gt; /dev/null

  sudo apt update -qq
  sudo apt install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

  sudo usermod -aG docker "$USER"
  success "Docker installed. Log out and back in for the group change to take effect"
fi</code></pre>

<p>The GPG key handling here is safer than the piped version from the last post. We download the key to a temp file first, then dearmor it — so a failed download produces an error rather than silently writing garbage to the keyring.</p>

<pre><code class="language-bash"># ── AWS CLI ───────────────────────────────────────────────────────────────────

if installed aws; then
  skip "AWS CLI already installed"
else
  info "Installing AWS CLI..."
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp/
  sudo /tmp/aws/install
  rm -rf /tmp/aws /tmp/awscliv2.zip
  success "AWS CLI installed"
fi</code></pre>

<pre><code class="language-bash"># ── Azure CLI ─────────────────────────────────────────────────────────────────

if installed az; then
  skip "Azure CLI already installed"
else
  info "Installing Azure CLI..."
  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
  success "Azure CLI installed"
fi</code></pre>

<pre><code class="language-bash"># ── gcloud CLI ────────────────────────────────────────────────────────────────

if installed gcloud; then
  skip "gcloud CLI already installed"
else
  info "Installing gcloud CLI..."
  curl -fsSL https://sdk.cloud.google.com | bash -s -- --disable-prompts
  # shellcheck disable=SC1091
  source "$HOME/.bashrc"
  success "gcloud CLI installed. Run 'gcloud init' to authenticate"
fi</code></pre>

<pre><code class="language-bash"># ── Terraform ─────────────────────────────────────────────────────────────────

if installed terraform; then
  skip "Terraform already installed"
else
  info "Installing Terraform..."
  wget -qO- https://apt.releases.hashicorp.com/gpg | \\
    sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \\
    https://apt.releases.hashicorp.com \$(lsb_release -cs) main" | \\
    sudo tee /etc/apt/sources.list.d/hashicorp.list &gt; /dev/null

  sudo apt update -qq &amp;&amp; sudo apt install -y -qq terraform
  success "Terraform installed"
fi</code></pre>

<pre><code class="language-bash"># ── kubectl ───────────────────────────────────────────────────────────────────

if installed kubectl; then
  skip "kubectl already installed"
else
  info "Installing kubectl..."
  KUBECTL_VERSION=\$(curl -fsSL https://dl.k8s.io/release/stable.txt)
  curl -fsSLO "https://dl.k8s.io/release/\${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
  rm kubectl
  success "kubectl installed"
fi</code></pre>

<p>Fetching the stable version string first, then constructing the download URL. This is cleaner than the nested <code>\$(curl ...)</code> in the previous post and easier to debug if the version fetch fails.</p>

<pre><code class="language-bash"># ── Ansible ───────────────────────────────────────────────────────────────────

if installed ansible; then
  skip "Ansible already installed"
else
  info "Installing Ansible..."
  sudo apt install -y -qq ansible
  success "Ansible installed"
fi</code></pre>

<pre><code class="language-bash"># ── Jenkins ───────────────────────────────────────────────────────────────────

if installed jenkins; then
  skip "Jenkins already installed"
else
  info "Installing Jenkins..."
  curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \\
    sudo tee /usr/share/keyrings/jenkins-keyring.asc &gt; /dev/null

  echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \\
    https://pkg.jenkins.io/debian-stable binary/" | \\
    sudo tee /etc/apt/sources.list.d/jenkins.list &gt; /dev/null

  sudo apt update -qq
  sudo apt install -y -qq jenkins
  success "Jenkins installed — available at http://localhost:8080"
fi</code></pre>

<pre><code class="language-bash"># ── VS Code ───────────────────────────────────────────────────────────────────

if installed code; then
  skip "VS Code already installed"
else
  info "Installing VS Code..."
  wget -qO- https://packages.microsoft.com/keys/microsoft.asc | \\
    gpg --dearmor &gt; /tmp/packages.microsoft.gpg
  sudo install -o root -g root -m 644 /tmp/packages.microsoft.gpg \\
    /etc/apt/trusted.gpg.d/
  sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" \\
    &gt; /etc/apt/sources.list.d/vscode.list'
  sudo apt update -qq
  sudo apt install -y -qq code
  rm /tmp/packages.microsoft.gpg
  success "VS Code installed"
fi</code></pre>

<pre><code class="language-bash"># ── Python ────────────────────────────────────────────────────────────────────

info "Ensuring Python tooling..."
sudo apt install -y -qq python3-pip python3-venv
success "Python pip and venv ready"</code></pre>

<p>Python itself ships with Ubuntu — we're only ensuring <code>pip</code> and <code>venv</code> are there.</p>

<pre><code class="language-bash"># ── VirtualBox ────────────────────────────────────────────────────────────────

if installed virtualbox; then
  skip "VirtualBox already installed"
else
  info "Installing VirtualBox..."
  sudo apt install -y -qq virtualbox
  success "VirtualBox installed"
fi</code></pre>

<pre><code class="language-bash"># ── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo "Setup complete. A few things need manual follow-up:"
echo "  1. Run 'aws configure' to set AWS credentials"
echo "  2. Run 'az login' for Azure"
echo "  3. Run 'gcloud init' for GCP"
echo "  4. Log out and back in for Docker group membership to take effect"
echo "  5. Get the Jenkins admin password: sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo ""</code></pre>

<p>The script can't finish the auth steps for you. It lists what's left so nothing gets missed.</p>

<hr />

<h2>Running it</h2>

<p>Make it executable, then run:</p>

<pre><code class="language-bash">chmod +x setup.sh
./setup.sh</code></pre>

<p>On a fresh machine, the full run takes 10 to 20 minutes depending on connection speed. On a machine where most tools are already installed, it finishes in under two minutes: everything skipped, a few package index refreshes.</p>

<p>If it fails partway through, fix the problem and run it again. Every block checks before installing, so completed steps don't re-run.</p>

<hr />

<h2>What the script doesn't handle</h2>

<p>Postman, Chrome, and Edge aren't in the script. All three require downloading <code>.deb</code> files or Snap packages from URLs that change with each release — automating them means either pinning a version (which ages badly) or adding version-detection logic that's more trouble than it's worth. For those three, the manual install from the previous post is the right approach.</p>

<p>The script also doesn't configure anything — no git identity, no SSH keys, no cloud credentials. Configuration is personal. Installation isn't.</p>

<hr />

<p>The complete script is on GitHub Gist. Download it and run:</p>

<pre><code class="language-bash">curl -fsSL https://gist.githubusercontent.com/nsisongeffiong/2085e4d71782d81a6ed6eb0ca792328e/raw/b173c49cc131363c94054d5a28c0859076167a67/setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh</code></pre>

<p>The next time you need a machine, you know what to do.</p>`,
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
